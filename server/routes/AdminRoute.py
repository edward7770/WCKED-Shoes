from CustomExceptions.DBException import DBException
from flask import Blueprint, request, Response
from models.AdminModel import login_handler
import json
import datetime
from settings import limiter

admin_blueprint = Blueprint("admin", __name__)

@admin_blueprint.route('/login', methods=["POST"])
@limiter.limit("2 per second")
def login():
  email = request.json.get("email")
  password = request.json.get("password")

  try:
    result = login_handler(email, password)
    resp = Response(json.dumps(result[1]), status=200, mimetype="application/json")
    resp.set_cookie(key="auth_token", value=result[0], expires=datetime.datetime.utcnow() + datetime.timedelta(hours=2), 
      httponly=True, samesite="Strict", secure=True)
    return resp
  except DBException as e:
    return Response(json.dumps({"error": e.message}), status=e.status_code, mimetype="application/json")
  except:
    return Response(json.dumps({"error": "An unexpected error occurred. Please report this issue if this continues."}), status=500, mimetype="application/json")