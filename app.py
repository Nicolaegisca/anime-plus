import os
import secrets
from flask import Flask, send_from_directory, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder=".", static_url_path="")
ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("ANIMEPLUS_DB_PATH") or os.path.join(ROOT, "animeplus.db")
app.config["SECRET_KEY"] = os.environ.get("ANIMEPLUS_SECRET_KEY") or secrets.token_hex(32)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + DB_PATH.replace("\\", "/")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def to_public(self):
        return {"id": self.id, "username": self.username}


@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    if User.query.filter_by(username=username).first() is not None:
        return jsonify({"error": "username already taken"}), 400
    password_hash = generate_password_hash(password)
    user = User(username=username, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify({"user": user.to_public()}), 201


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401
    session["user_id"] = user.id
    return jsonify({"user": user.to_public()}), 200


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("user_id", None)
    return jsonify({"ok": True}), 200


@app.route("/api/me", methods=["GET"])
def api_me():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"user": None}), 200
    user = User.query.get(uid)
    if not user:
        return jsonify({"user": None}), 200
    return jsonify({"user": user.to_public()}), 200


@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/<path:path>")
def serve(path):
    if ".." in path:
        return "", 404
    full = os.path.join(ROOT, path)
    if os.path.isfile(full):
        return send_from_directory(ROOT, path)
    if os.path.isfile(os.path.join(ROOT, path + ".html")):
        return send_from_directory(ROOT, path + ".html")
    return "", 404


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)