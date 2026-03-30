create table if not exists city
(
    city_id         serial
        primary key,
    name            text    not null,
    timezone_offset integer not null
);

create table if not exists establishment_type
(
    type_id     serial
        primary key,
    name        text not null,
    description text
);

create table if not exists establishment
(
    establishment_id serial
        primary key,
    city_id          integer not null
        constraint fk_establishment_city
            references city,
    type_id          integer not null
        constraint fk_establishment_type
            references establishment_type,
    address          text    not null,
    postal_code      text,
    phone            text,
    employees_count  integer,
    income           numeric(14, 2),
    free_seats       integer,
    info             text
);

create table if not exists employee
(
    employee_id serial
        primary key,
    full_name   text not null,
    position    text,
    contacts    text,
    experience  integer,
    salary      numeric(12, 2),
    info        text,
    workplace   text,
    age         integer
);

create index if not exists idx_employee_position_salary
    on employee (position, salary);

create table if not exists establishment_employee
(
    employee_id      integer not null
        constraint fk_est_emp_employee
            references employee,
    establishment_id integer not null
        constraint fk_est_emp_est
            references establishment,
    work_since       date,
    role_in_place    text,
    primary key (employee_id, establishment_id)
);

create table if not exists dish_category
(
    category_id serial
        primary key,
    name        text not null
);

create table if not exists dish
(
    dish_id      serial
        primary key,
    category_id  integer        not null
        constraint fk_dish_category
            references dish_category,
    name         text           not null,
    price        numeric(10, 2) not null,
    cook_time    integer,
    is_available boolean default true,
    recipe       text
);

create index if not exists idx_dish_category_available
    on dish (category_id, is_available);

create table if not exists establishment_menu
(
    establishment_id integer not null
        constraint fk_menu_est
            references establishment,
    dish_id          integer not null
        constraint fk_menu_dish
            references dish,
    primary key (establishment_id, dish_id)
);

create table if not exists supplier
(
    supplier_id  serial
        primary key,
    full_name    text not null,
    service_cost numeric(12, 2),
    location     text,
    contact_info text,
    address      text
);

create table if not exists ingredient
(
    ingredient_id   serial
        primary key,
    name            text    not null,
    stock_amount    integer not null,
    expiration_date date,
    supplier_id     integer not null
        constraint fk_ingredient_supplier
            references supplier
);

create table if not exists dish_ingredient
(
    dish_id       integer not null
        constraint fk_di_dish
            references dish,
    ingredient_id integer not null
        constraint fk_di_ingredient
            references ingredient,
    amount        integer not null,
    primary key (dish_id, ingredient_id)
);

create table if not exists order_main
(
    order_id         serial
        primary key,
    establishment_id integer   not null
        constraint fk_order_est
            references establishment,
    employee_id      integer   not null
        constraint fk_order_main_employee
            references employee,
    status           text      not null,
    dishes_count     integer,
    created_at       timestamp not null,
    completed_at     timestamp,
    notes            text,
    table_number     integer
);

create index if not exists idx_order_est_status
    on order_main (establishment_id, status);

create table if not exists order_item
(
    order_item_id serial
        primary key,
    order_id      integer not null
        constraint fk_order_item_order
            references order_main,
    dish_id       integer not null
        constraint fk_order_item_dish
            references dish,
    amount        integer not null,
    price         numeric(10, 2),
    wishes        text
);

create table if not exists systems_role
(
    role_id     serial
        primary key,
    name        text not null
        unique,
    description text
);

create table if not exists systems_user
(
    user_id       serial
        primary key,
    employee_id   integer not null
        constraint fk_systems_user_employee
            references employee,
    login         text    not null
        unique,
    password_hash text    not null,
    role_id       integer not null
        constraint fk_systems_user_role
            references systems_role
);

create unique index if not exists idx_systems_user_login
    on systems_user (login);

DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'group_manager') THEN
        CREATE ROLE group_manager;
    END IF;
END
$$;

DROP POLICY IF EXISTS manager_access_order ON order_main;

create policy manager_access_order on order_main
    as permissive
    for all
    to group_manager
    using (establishment_id IN (SELECT ee.establishment_id
                                FROM (establishment_employee ee
                                    JOIN systems_user su ON ((ee.employee_id = su.employee_id)))
                                WHERE (su.login = CURRENT_USER)))
    with check (establishment_id IN (SELECT ee.establishment_id
                                     FROM (establishment_employee ee
                                         JOIN systems_user su ON ((ee.employee_id = su.employee_id)))
                                     WHERE (su.login = CURRENT_USER)));

create function check_employee_city() returns trigger
    language plpgsql
as
$$
DECLARE
    new_city_id INT;
    existing_city_id INT;
BEGIN
    -- Находим ID города нового заведения
    SELECT city_id INTO new_city_id
    FROM establishment
    WHERE establishment_id = NEW.establishment_id;

    -- Ищем город, в котором сотрудник уже работает
    SELECT e.city_id INTO existing_city_id
    FROM establishment_employee ee
    JOIN establishment e ON ee.establishment_id = e.establishment_id
    WHERE ee.employee_id = NEW.employee_id
    LIMIT 1;

    -- Если сотрудник уже где-то работает И новый город отличается от существующего
    IF existing_city_id IS NOT NULL AND new_city_id != existing_city_id THEN
        RAISE EXCEPTION 'Сотрудник % уже работает в городе с ID %, не может быть добавлен в заведение другого города (ID %)',
            NEW.employee_id, existing_city_id, new_city_id;
    END IF;

    RETURN NEW;
END;
$$;

create trigger tr_check_employee_city
    before insert or update
    on establishment_employee
    for each row
execute procedure check_employee_city();

create function tr_dish_availability_on_stock_change() returns trigger
    language plpgsql
as
$$
DECLARE
    dish_rec RECORD;
BEGIN
    -- Обновляем доступность всех блюд, использующих измененный ингредиент
    FOR dish_rec IN
        SELECT di.dish_id
        FROM dish_ingredient di
        WHERE di.ingredient_id = NEW.ingredient_id
    LOOP
        PERFORM fn_update_dish_availability(dish_rec.dish_id);
    END LOOP;
    
    RETURN NEW;
END;
$$;

create trigger tr_update_dish_availability
    after update
        of stock_amount
    on ingredient
    for each row
    when (old.stock_amount IS DISTINCT FROM new.stock_amount)
execute procedure tr_dish_availability_on_stock_change();

create function fn_update_dish_availability(dish_id_param integer) returns boolean
    language plpgsql
as
$$
DECLARE
    is_available_flag BOOLEAN := TRUE;
    ing_rec RECORD;
BEGIN
    -- Проверяем каждый ингредиент для данного блюда
    FOR ing_rec IN
        SELECT di.amount AS required_amount, i.stock_amount
        FROM dish_ingredient di
        JOIN ingredient i ON di.ingredient_id = i.ingredient_id
        WHERE di.dish_id = dish_id_param
    LOOP
        -- Если запас меньше, чем необходимо для одной порции
        IF ing_rec.stock_amount < ing_rec.required_amount THEN
            is_available_flag := FALSE;
            EXIT; -- Нет смысла проверять дальше, если один ингредиент отсутствует
        END IF;
    END LOOP;
    
    -- Обновляем статус доступности блюда
    UPDATE dish
    SET is_available = is_available_flag
    WHERE dish_id = dish_id_param;
    
    RETURN is_available_flag;
END;
$$;

create function fn_calculate_order_total() returns trigger
    language plpgsql
as
$$
BEGIN
    UPDATE order_main
    SET dishes_count = (
        SELECT COALESCE(SUM(amount), 0)
        FROM order_item
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN NULL;
END;
$$;

create trigger tr_update_dishes_count
    after insert or update or delete
    on order_item
    for each row
execute procedure fn_calculate_order_total();

create procedure pr_suggest_alternative(IN est_id integer)
    language plpgsql
as
$$
DECLARE
    free_seats_val INT;
    city_id_val INT;
    alt_est RECORD;
    alt_est_count INT;
BEGIN
    SELECT free_seats, city_id INTO free_seats_val, city_id_val
    FROM establishment
    WHERE establishment_id = est_id;

    IF free_seats_val <= 5 THEN -- Если осталось мало свободных мест
        RAISE NOTICE 'В заведении (ID: %) осталось мало мест (%), предлагаем рассмотреть альтернативы.', est_id, free_seats_val;

        -- Ищем свободные места в других заведениях в том же городе
        SELECT COUNT(*) INTO alt_est_count
        FROM establishment
        WHERE city_id = city_id_val
          AND establishment_id != est_id
          AND free_seats > 5;

        IF alt_est_count > 0 THEN
            RAISE NOTICE 'Доступны % альтернативных заведений поблизости с достаточным количеством мест:', alt_est_count;
            FOR alt_est IN
                SELECT address, phone
                FROM establishment
                WHERE city_id = city_id_val
                  AND establishment_id != est_id
                  AND free_seats > 5
                LIMIT 3
            LOOP
                RAISE NOTICE '  - Адрес: %, Телефон: %', alt_est.address, alt_est.phone;
            END LOOP;
        ELSE
            RAISE NOTICE 'Альтернативных заведений в этом городе с достаточным количеством мест не найдено. Предложите клиенту бронирование на другое время.';
        END IF;
    ELSE
        RAISE NOTICE 'Заведение (ID: %) достаточно свободно (мест: %). Альтернативы не требуются.', est_id, free_seats_val;
    END IF;
END;
$$;


