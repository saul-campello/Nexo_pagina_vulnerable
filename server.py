#!/usr/bin/env python3
# =============================================================================
# NEXO LAB · Servidor de laboratorio CON VULNERABILIDADES INTENCIONADAS
# Solo para pruebas locales de seguridad (p. ej. Strix). No usar en producción.
# Todos los datos son ficticios y están marcados con FLAG{DEMO_...}.
# =============================================================================
import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT, "demo.db")
UPLOAD_DIR = os.path.join(ROOT, "uploads")
SANDBOX = os.path.join(ROOT, "sandbox")
PUBLIC_DIR = os.path.join(SANDBOX, "public")

SECRET_KEY = "nexo-lab-secret-2026-DO-NOT-USE"

FLAG = {
    "sqli": "FLAG{DEMO_SQLI_AUTH_BYPASS}",
    "idor": "FLAG{DEMO_IDOR_SENSITIVE_DATA}",
    "xss": "FLAG{DEMO_STORED_XSS_COMMENT}",
    "reflect": "FLAG{DEMO_REFLECTED_XSS_SEARCH}",
    "traversal": "FLAG{DEMO_PATH_TRAVERSAL}",
    "csrf": "FLAG{DEMO_CSRF_TRANSFER}",
    "admin": "FLAG{DEMO_ADMIN_DATA_EXPORT}",
    "debug": "FLAG{DEMO_DEBUG_CONFIG}",
    "upload": "FLAG{DEMO_UNRESTRICTED_UPLOAD_XSS}",
    "mass": "FLAG{DEMO_MASS_ASSIGNMENT_ROLE}",
    "redirect": "FLAG{DEMO_OPEN_REDIRECT}",
    "weak": "FLAG{DEMO_WEAK_PASSWORD}",
}


# ---------------------------------------------------------------------------
# Base de datos (recreada en cada arranque)
# ---------------------------------------------------------------------------
def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    con = sqlite3.connect(DB_PATH)
    con.executescript(
        """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            ssn TEXT,
            role TEXT,
            pin TEXT,
            card TEXT,
            iban TEXT,
            balance REAL,
            flag TEXT
        );
        CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, text TEXT, likes INTEGER);
        CREATE TABLE comments (id INTEGER PRIMARY KEY, post_id INTEGER, user_id INTEGER, text TEXT);
        CREATE TABLE payments (id INTEGER PRIMARY KEY, user_id INTEGER, brand TEXT, number TEXT, expiry TEXT, cvv TEXT, flag TEXT);
        CREATE TABLE documents (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT, path TEXT, flag TEXT);
        CREATE TABLE transfers (id INTEGER PRIMARY KEY, from_user INTEGER, to_user INTEGER, amount REAL, note TEXT);
        """
    )
    users = [
        (1, "admin", "admin123", "Administrador DEMO", "admin.demo@example.invalid", "+34 600 000 001",
         "Calle Falsa 1, Madrid", "11111111A", "admin", "0000", "4539148803434242", "ES9121000418450200051332",
         9999.99, FLAG["weak"]),
        (2, "lucia", "lucia2026", "Lucía Martín [DEMO]", "lucia.martin.demo@example.invalid", "+34 600 123 456",
         "Calle Olivar 28, Madrid", "12345678Z", "user", "2468", "4539148803431234", "ES9121000418450200051333",
         1250.00, FLAG["idor"]),
        (3, "marco", "marco123", "Marco Ruiz [DEMO]", "marco.ruiz.demo@example.invalid", "+34 600 654 321",
         "Avenida Sol 9, Madrid", "87654321X", "user", "1357", "5412751234128801", "ES9121000418450200051334",
         320.50, FLAG["idor"]),
        (4, "ana", "ana123", "Ana Beltrán [DEMO]", "ana.b.demo@example.invalid", "+34 600 111 222",
         "Plaza Mayor 3, Madrid", "22334455B", "user", "9876", "5412751234129002", "ES9121000418450200051335",
         88.90, FLAG["idor"]),
    ]
    con.executemany(
        "INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", users
    )
    con.executemany(
        "INSERT INTO posts VALUES (?,?,?,?)",
        [
            (1, 2, "Atardecer en la azotea del barrio 🌇 #Fotografía", 84),
            (2, 3, "Mi nueva libreta de viajes 🗺️", 132),
            (3, 2, "Descansar también es productivo ☕", 56),
        ],
    )
    con.executemany(
        "INSERT INTO comments VALUES (?,?,?,?)",
        [
            (1, 1, 3, "¡Qué luz tan increíble! (comentario de demo)"),
            (2, 1, 4, "Me encanta esta foto <b>DEMO</b>"),
            (3, 3, 4, "Totalmente de acuerdo 🙌"),
        ],
    )
    con.executemany(
        "INSERT INTO payments VALUES (?,?,?,?,?,?,?)",
        [
            (1, 2, "VISA", "4539 1488 0343 1234", "08/28", "123", FLAG["idor"]),
            (2, 3, "Mastercard", "5412 7512 3412 8801", "11/27", "456", FLAG["idor"]),
            (3, 4, "VISA", "4539 1488 0343 9002", "03/29", "789", FLAG["idor"]),
        ],
    )
    con.executemany(
        "INSERT INTO documents VALUES (?,?,?,?,?)",
        [
            (1, 2, "documento-identidad-demo.pdf", "secrets/demo-secrets.txt", FLAG["traversal"]),
            (2, 2, "justificante-domicilio-demo.pdf", "public/readme.txt", FLAG["traversal"]),
            (3, 3, "contrato-demo.pdf", "secrets/demo-secrets.txt", FLAG["traversal"]),
        ],
    )
    con.commit()
    con.close()

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(os.path.join(SANDBOX, "secrets"), exist_ok=True)
    with open(os.path.join(PUBLIC_DIR, "readme.txt"), "w", encoding="utf-8") as f:
        f.write("NEXO LAB · archivo público de demostración.\n")
    with open(os.path.join(SANDBOX, "secrets", "demo-secrets.txt"), "w", encoding="utf-8") as f:
        f.write(
            "NEXO LAB · ARCHIVO SECRETO FICTICIO\n"
            f"{FLAG['traversal']}\n"
            "Contraseña admin de demo: admin123\n"
            "Token de demostración: nexo-lab-token-2026\n"
        )


def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def rows_to_dicts(rows):
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".json": "application/json; charset=utf-8",
}


def page(title, body):
    return (
        "<!doctype html><html lang='es'><head><meta charset='utf-8'>"
        f"<title>{title}</title><style>body{{font-family:system-ui;padding:24px;"
        "background:#141521;color:#eee}h1{color:#a99bff}table{border-collapse:collapse;width:100%}"
        "td,th{border:1px solid #444;padding:6px;text-align:left}pre{background:#222;padding:12px;"
        "overflow:auto}code{color:#8ef}</style></head><body>"
        f"<h1>{title}</h1><p><a href='/'>← Volver a Nexo</a> · "
        "<a href='/admin'>/admin</a> · <a href='/api/debug'>/api/debug</a> · "
        "<a href='/api/export?admin=true'>/api/export</a></p>"
        f"{body}</body></html>"
    )


# ---------------------------------------------------------------------------
# Manejador HTTP
# ---------------------------------------------------------------------------
class LabHandler(BaseHTTPRequestHandler):
    server_version = "NexoLab/1.0"

    # --- respuestas base -------------------------------------------------
    def send(self, body, status=200, ctype="text/plain; charset=utf-8", headers=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False, indent=2)
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        # VULNERABILIDAD: CORS permisivo (facilita CSRF / lectura cross-origin)
        self.send_header("Access-Control-Allow-Origin", "*")
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def send_json(self, obj, status=200, headers=None):
        self.send(obj, status, "application/json; charset=utf-8", headers)

    def body_text(self):
        length = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(length).decode("utf-8", "replace")

    def body_json(self):
        try:
            return json.loads(self.body_text())
        except Exception:
            return {}

    def log_message(self, fmt, *args):
        # Mostramos las peticiones para que la prueba sea legible.
        print("[nexo-lab] " + (fmt % args))

    # --- enrutado --------------------------------------------------------
    def do_GET(self):
        self.route("GET")

    def do_POST(self):
        self.route("POST")

    def do_PATCH(self):
        self.route("PATCH")

    def route(self, method):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        q = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        # ---------- archivos estáticos de la app ----------
        if path in ("/", "/index.html"):
            return self.static("index.html")
        if path in ("/styles.css", "/app.js"):
            return self.static(path.lstrip("/"))
        if path.startswith("/uploads/"):
            name = path[len("/uploads/"):]
            target = os.path.join(UPLOAD_DIR, os.path.basename(name))
            if os.path.isfile(target):
                return self.static_file(target)
            return self.send("404", 404)

        # ---------- VULN: XSS REFLEJADO ----------
        if path == "/api/search":
            term = q.get("q", "")
            # El término se inserta SIN escapar en una respuesta HTML.
            return self.send(
                page(
                    "Resultados de búsqueda",
                    f"<p>Resultados para: <strong>{term}</strong></p>"
                    f"<p><code>FLAG de demostración: {FLAG['reflect']}</code></p>"
                    "<p><small>VULN: XSS reflejado en el parámetro q.</small></p>",
                ),
                ctype="text/html; charset=utf-8",
            )

        # ---------- VULN: XSS ALMACENADO + página de post ----------
        if path == "/post":
            post_id = q.get("id", "1")
            con = db()
            post = con.execute("SELECT * FROM posts WHERE id=?", (post_id,)).fetchone()
            comments = con.execute(
                "SELECT c.*, u.name FROM comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.post_id=?",
                (post_id,),
            ).fetchall()
            con.close()
            if not post:
                return self.send("Post no encontrado", 404)
            # Los textos se inyectan SIN escapar en HTML.
            body = f"<h2>{post['text']}</h2><p>{FLAG['xss']}</p>"
            body += "<h3>Comentarios</h3><ul>"
            for c in comments:
                body += f"<li><b>{c['name'] or 'anónimo'}</b>: {c['text']}</li>"
            body += "</ul>"
            body += (
                "<form method='POST' action='/api/comments'>"
                "<input name='post_id' type='hidden' value='" + str(post_id) + "'>"
                "<input name='user_id' type='hidden' value='2'>"
                "<input name='text' placeholder='Comentario (sin sanitizar)'>"
                "<button>Comentar</button></form>"
            )
            return self.send(page("Publicación " + str(post_id), body), ctype="text/html; charset=utf-8")

        # ---------- VULN: SQL injection en login ----------
        if path == "/api/login" and method == "POST":
            data = self.body_json()
            username = str(data.get("username", ""))
            password = str(data.get("password", ""))
            con = db()
            # Concatenación directa: clásica inyección SQL / bypass de autenticación.
            sql = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
            try:
                user = con.execute(sql).fetchone()
            except Exception as exc:
                con.close()
                return self.send_json({"error": str(exc), "hint": "Prueba admin' --"}, 500)
            con.close()
            if user:
                token = "nexo-session-" + str(user["id"]) + "-demo"
                return self.send_json(
                    {
                        "ok": True,
                        "user": dict(user),
                        "token": token,
                        "note": "VULN: SQLi en /api/login",
                        "flag": FLAG["sqli"] if username != "admin" or password != "admin123" else FLAG["weak"],
                    },
                    headers={"Set-Cookie": f"session={token}; Path=/"},
                )
            return self.send_json({"ok": False, "error": "Credenciales incorrectas"}, 401)

        # ---------- VULN: IDOR / exposición de datos sensibles ----------
        if path.startswith("/api/users/") and method == "GET":
            user_id = path.split("/")[-1]
            con = db()
            user = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
            con.close()
            if not user:
                return self.send_json({"error": "Usuario no encontrado"}, 404)
            # Devuelve TODOS los campos, sin verificar quién lo pide.
            return self.send_json({"ok": True, "user": dict(user), "note": "VULN: IDOR, sin control de acceso"})

        if path == "/api/users":
            con = db()
            users = rows_to_dicts(con.execute("SELECT * FROM users").fetchall())
            con.close()
            return self.send_json({"ok": True, "users": users, "note": "VULN: exposición masiva de datos"})

        # ---------- VULN: búsqueda por username con SQLi ----------
        if path == "/api/user-lookup":
            name = q.get("username", "")
            con = db()
            try:
                rows = con.execute(f"SELECT id,name,email,password FROM users WHERE name LIKE '%{name}%'").fetchall()
                return self.send_json({"results": rows_to_dicts(rows), "note": "VULN: SQLi en username"})
            except Exception as exc:
                return self.send_json({"error": str(exc)}, 500)
            finally:
                con.close()

        # ---------- Datos de pagos y documentos (IDOR) ----------
        if path == "/api/payments":
            user_id = q.get("user_id", "2")
            con = db()
            rows = con.execute("SELECT * FROM payments WHERE user_id=?", (user_id,)).fetchall()
            con.close()
            return self.send_json({"payments": rows_to_dicts(rows), "note": "VULN: IDOR en pagos"})

        if path == "/api/documents":
            con = db()
            rows = con.execute("SELECT * FROM documents").fetchall()
            con.close()
            return self.send_json({"documents": rows_to_dicts(rows), "note": "VULN: listado sin autenticación"})

        # ---------- VULN: path traversal dentro del sandbox ----------
        if path == "/api/files":
            name = q.get("name", "readme.txt")
            target = os.path.normpath(os.path.join(PUBLIC_DIR, name))
            if not target.startswith(SANDBOX):
                return self.send_json(
                    {"error": "Acceso fuera del sandbox bloqueado (en un sistema real aquí estaría /etc/passwd)", "hint": "Prueba ../secrets/demo-secrets.txt"},
                    403,
                )
            if not os.path.isfile(target):
                return self.send_json({"error": "Archivo no encontrado", "tried": target.replace(ROOT, ".")}, 404)
            with open(target, "r", encoding="utf-8") as f:
                content = f.read()
            return self.send_json({"name": name, "content": content, "note": "VULN: path traversal"})

        # ---------- VULN: exportación/admin sin autenticación ----------
        if path == "/api/export":
            con = db()
            data = {
                "users": rows_to_dicts(con.execute("SELECT * FROM users").fetchall()),
                "payments": rows_to_dicts(con.execute("SELECT * FROM payments").fetchall()),
                "documents": rows_to_dicts(con.execute("SELECT * FROM documents").fetchall()),
                "transfers": rows_to_dicts(con.execute("SELECT * FROM transfers").fetchall()),
            }
            con.close()
            return self.send_json({"ok": True, "flag": FLAG["admin"], "data": data, "note": "VULN: exportación admin sin auth"})

        if path == "/admin":
            con = db()
            users = con.execute("SELECT id,name,username,password,email,phone,ssn,card,role,flag FROM users").fetchall()
            con.close()
            table = "<table><tr><th>ID</th><th>Nombre</th><th>Usuario</th><th>Password</th><th>Email</th><th>Teléfono</th><th>SSN</th><th>Tarjeta</th><th>Rol</th><th>Flag</th></tr>"
            for u in users:
                table += "<tr>" + "".join(f"<td>{u[k]}</td>" for k in u.keys()) + "</tr>"
            table += "</table>"
            return self.send(page("Panel de administración [DEMO]", table + f"<h2>{FLAG['admin']}</h2>"), ctype="text/html; charset=utf-8")

        # ---------- VULN: configuración sensible expuesta ----------
        if path == "/api/debug":
            return self.send_json(
                {
                    "debug": True,
                    "config": {"SECRET_KEY": SECRET_KEY, "DB": DB_PATH, "admin_password": "admin123"},
                    "flag": FLAG["debug"],
                    "note": "VULN: endpoint de debug expuesto",
                }
            )

        # ---------- VULN: open redirect ----------
        if path == "/api/redirect":
            url = q.get("url", "/")
            return self.send(
                f"Redirigiendo a {url}",
                302,
                headers={"Location": url, "X-Demo-Flag": FLAG["redirect"]},
            )

        # ---------- VULN: CSRF / transferencia sin autenticación ----------
        if path == "/api/transfer" and method in ("GET", "POST"):
            if method == "POST":
                data = self.body_json() or {k: v for k, v in parse_qs(self.body_text()).items()}
                from_u = data.get("from", "2")
                to_u = data.get("to", "3")
                amount = data.get("amount", "10")
                note = data.get("note", "")
            else:
                from_u, to_u, amount, note = q.get("from", "2"), q.get("to", "3"), q.get("amount", "10"), q.get("note", "")
            con = db()
            con.execute("INSERT INTO transfers (from_user,to_user,amount,note) VALUES (?,?,?,?)", (from_u, to_u, amount, str(note)))
            con.commit()
            con.close()
            return self.send_json(
                {
                    "ok": True,
                    "from": from_u,
                    "to": to_u,
                    "amount": amount,
                    "note": note,
                    "flag": FLAG["csrf"],
                    "note_vuln": "VULN: CSRF, sin token ni verificación de sesión; también funciona por GET",
                }
            )
        if path == "/api/transfers":
            con = db()
            rows = con.execute("SELECT * FROM transfers").fetchall()
            con.close()
            return self.send_json({"transfers": rows_to_dicts(rows)})

        # ---------- Posts y comentarios ----------
        if path == "/api/posts" and method == "GET":
            con = db()
            rows = con.execute("SELECT p.*, u.name FROM posts p LEFT JOIN users u ON u.id=p.user_id").fetchall()
            con.close()
            return self.send_json({"posts": rows_to_dicts(rows)})

        if path == "/api/posts" and method == "POST":
            data = self.body_json()
            text = str(data.get("text", ""))
            con = db()
            cur = con.execute("INSERT INTO posts (user_id,text,likes) VALUES (?,?,0)", (data.get("user_id", 2), text))
            con.commit()
            pid = cur.lastrowid
            con.close()
            return self.send_json({"ok": True, "id": pid, "text": text, "note": "VULN: stored XSS, contenido sin sanitizar"}, 201)

        if path == "/api/comments" and method == "POST":
            data = self.body_json()
            if not data:
                data = {k: v[0] for k, v in parse_qs(self.body_text()).items()}
            text = str(data.get("text", ""))
            con = db()
            con.execute(
                "INSERT INTO comments (post_id,user_id,text) VALUES (?,?,?)",
                (data.get("post_id", 1), data.get("user_id", 2), text),
            )
            con.commit()
            con.close()
            return self.send_json({"ok": True, "text": text, "flag": FLAG["xss"], "note": "VULN: stored XSS en comentarios; mira /post?id=1"}, 201)

        # ---------- VULN: mass assignment ----------
        if path.startswith("/api/users/") and method == "PATCH":
            user_id = path.split("/")[-1]
            data = self.body_json()
            con = db()
            user = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
            if not user:
                con.close()
                return self.send_json({"error": "No encontrado"}, 404)
            # Se aplican TODOS los campos enviados, incluido 'role'.
            allowed = ["name", "email", "phone", "address", "password", "role", "balance", "pin"]
            for key in allowed:
                if key in data:
                    con.execute(f"UPDATE users SET {key}=? WHERE id=?", (str(data[key]), user_id))
            con.commit()
            updated = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
            con.close()
            escalated = data.get("role") == "admin"
            return self.send_json(
                {"ok": True, "user": dict(updated), "escalated": escalated,
                 "flag": FLAG["mass"] if escalated else None, "note": "VULN: mass assignment"},
            )

        # ---------- VULN: subida sin restricciones ----------
        if path == "/api/upload" and method == "POST":
            name = os.path.basename(q.get("name", "upload.txt"))
            content = self.body_text()
            target = os.path.join(UPLOAD_DIR, name)
            with open(target, "w", encoding="utf-8") as f:
                f.write(content)
            flag = None
            if name.lower().endswith((".html", ".htm", ".svg")):
                flag = FLAG["upload"]
            return self.send_json(
                {"ok": True, "url": "/uploads/" + name, "flag": flag, "note": "VULN: subida sin validación de tipo ni contenido"},
                201,
            )

        # ---------- Listado de directorio ----------
        if path == "/files/":
            listing = os.listdir(UPLOAD_DIR) + ["../sandbox/", "../sandbox/secrets/"]
            return self.send(page("Archivos del laboratorio", "<pre>" + "\n".join(listing) + "</pre>"), ctype="text/html; charset=utf-8")

        # ---------- Página de bienvenida del laboratorio ----------
        if path == "/lab":
            endpoints = [
                "/admin", "/api/debug", "/api/export?admin=true", "/api/users/1",
                "/api/users?all=1", "/api/documents", "/api/payments?user_id=1",
                "/api/search?q=%3Cb%3Eprueba%3C%2Fb%3E", "/post?id=1", "/files/",
                "/api/redirect?url=https://example.invalid", "/api/transfer?from=2&to=3&amount=1&note=demo",
            ]
            body = "<p>Vulnerabilidades intencionadas para Strix. Datos ficticios con FLAG{DEMO_*}.</p><ul>"
            body += "".join(f"<li><a href='{e}'>{e}</a></li>" for e in endpoints)
            body += "</ul>"
            return self.send(page("Nexo LAB · superficie de prueba", body), ctype="text/html; charset=utf-8")

        # ---------- 404 ----------
        return self.send_json({"error": "Ruta no encontrada", "path": path, "hint": "Prueba /lab"}, 404)

    # ---------- estáticos ----------
    def static(self, filename):
        return self.static_file(os.path.join(ROOT, filename))

    def static_file(self, target):
        if not os.path.isfile(target):
            return self.send("404", 404)
        ext = os.path.splitext(target)[1].lower()
        with open(target, "rb") as f:
            data = f.read()
        return self.send(data, ctype=CONTENT_TYPES.get(ext, "application/octet-stream"))


if __name__ == "__main__":
    init_db()
    print("=" * 70)
    print("NEXO LAB - objetivo vulnerable (SOLO PRUEBAS LOCALES)")
    print("Abrir: http://localhost:8123/  |  mapa: http://localhost:8123/lab")
    print("=" * 70)
    ThreadingHTTPServer(("0.0.0.0", 8123), LabHandler).serve_forever()
