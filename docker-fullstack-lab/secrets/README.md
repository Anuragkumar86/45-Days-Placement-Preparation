Create the following local-only files before running Compose:

- `postgres_admin_password.txt` — password for PostgreSQL's bootstrap/admin role.
- `app_db_password.txt` — password for the restricted `notesapp` application role.

Keep these files out of source control. The root `.gitignore` excludes both `*.txt` files in this directory. The sample values shown in the main README are for local learning only and must not be used in a real deployment.
