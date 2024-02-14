from flask import Blueprint, Response, request
from models.DiscountCodeModel import expire_discount_code_handler, create_discount_code_handler
from CustomExceptions.DBException import DBException 
from middleware.Authentication import authenticate_admin
from settings import limiter
import json

discount_code_blueprint = Blueprint("discount_code", __name__)

@discount_code_blueprint.route("/<code_name>", methods=["PUT"])
@authenticate_admin
@limiter.limit("2 per second")
def expire_discount_code(code_name):
  try:
    expire_discount_code_handler(code_name)
    return Response(json.dumps({"success": "Set discount code validity to expired."}), status=200, mimetype="application/json")
  except DBException as e:
    return Response(json.dumps({"error": e.message}), status=e.status_code, mimetype="application/json")
  except:
    return Response(json.dumps({"error": "An unexpected error occurred. Please report this issue if this continues."}), status=500, mimetype="application/json")

@discount_code_blueprint.route("/create", methods=["POST"])
@authenticate_admin
@limiter.limit("2 per second")
def create_discount_code():
  try:
    code_name = request.json.get("code_name")
    percent_off = request.json.get("percent_off")
    create_discount_code_handler(code_name, (float)(percent_off))
    return Response(json.dumps({"success": f"Created discount code: {code_name}."}), status=200, mimetype="application/json")
  except DBException as e:
    return Response(json.dumps({"error": e.message}), status=e.status_code, mimetype="application/json")
  except ValueError:
    return Response(json.dumps({"error": "Discount percentage is invalid."}), status=400, mimetype="application/json")
  except:
    return Response(json.dumps({"error": "An unexpected error occurred. Please report this issue if this continues."}), status=500, mimetype="application/json")