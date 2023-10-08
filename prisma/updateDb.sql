-- Create special permission in ESE DB for additionnal API
insert into rest_api_permissions (permission_string, description)
values ('HIVEMQ_ESEAPI_ADMIN', 'special rest_api_permission, that allows access to ESE API');

-- Create special role in ESE DB for additionnal API
insert into rest_api_roles (name, description)
values ('eseapi_admin', 'has the HIVEMQ_ESEAPI_ADMIN permission');

-- Map role and permission
insert into rest_api_role_permissions (role, permission)
select rest_api_roles.id, rest_api_permissions.id
from rest_api_roles,
     rest_api_permissions
where rest_api_roles.name = 'eseapi_admin'
  AND rest_api_permissions.permission_string = 'HIVEMQ_ESEAPI_ADMIN';

-- Create the first user with eseapi admin permission
insert into rest_api_users (username, password, password_iterations, password_salt, algorithm)
values ('eseapiadmin', 'nOgr9xVnkt51Lr68KS/rAKm/LqxAt8oEki7vCerRod3qDbyMFfDBGT8obnkw+AGygxCQDWdaA2sQnXXoAbVK6Q==', 100, 'wxw+3diCV4bWXQHb6LLniA==', 'SHA512');

-- Map user to eseapi_admin role
INSERT INTO rest_api_user_roles (user_id, role_id)
select rest_api_users.id, rest_api_roles.id
from rest_api_users,
     rest_api_roles
where rest_api_users.username = 'eseapiadmin'
  AND rest_api_roles.name = 'eseapi_admin'
;