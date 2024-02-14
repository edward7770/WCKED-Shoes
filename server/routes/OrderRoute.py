from flask import Blueprint, Response, g, request
from models.OrderModel import get_order_handler, get_orders_handler, update_order_status_handler
from CustomExceptions.DBException import DBException
from middleware.Authentication import authenticate_user, authenticate_admin
import json
from settings import limiter
from utils.Redis import cache

orders_blueprint = Blueprint("orders", __name__)

@orders_blueprint.route("", methods=["GET"])
@authenticate_user
@limiter.limit("2 per second")
def get_orders():
  try:
    user_id = g.token["sub"]["id"]
    search = request.args.get("search", "", str)
    page = request.args.get("page", "1", str)
    limit = request.args.get("limit", "10", str)
    filter = request.args.get("filter", "", str)
    orders = get_orders_handler(user_id, search, (int)(page), (int)(limit), filter)
    return Response(json.dumps(orders), status=200, mimetype="application/json")
  except DBException as e:
    return Response(json.dumps({"error": e.message}), status=e.status_code, mimetype="application/json")
  except ValueError:
    return Response(json.dumps({"error": "'page' and 'limit' query parameters must be numbers."}), status=400, mimetype="application/json")
  except:
    return Response(json.dumps({"error": "An unexpected error occurred. Please report this issue if this continues."}), status=500, mimetype="application/json")

@orders_blueprint.route("/<id>", methods=["GET"])
@authenticate_user
@limiter.limit("2 per second")
def get_order(id):
  try:
    user_id = g.token["sub"]["id"]
    order = cache(f"/orders/${id}", get_order_handler, 3600, id, user_id)
    return Response(json.dumps(order), status=200, mimetype="application/json")
  except DBException as e:
    return Response(json.dumps({"error": e.message}), status=e.status_code, mimetype="application/json")
  except:
    return Response(json.dumps({"error": "An unexpected error occurred. Please report this issue if this continues."}), status=500, mimetype="application/json")

@orders_blueprint.route("/<id>/update-status", methods=["PUT"])
@authenticate_admin
@limiter.limit("2 per second")
def update_order_status(id):
  status = request.json.get("status")
  if status != "Order Created" and status != "Processing" and status != "Shipped" and status != "Delivered":
    return Response(json.dumps({"error": "Order status is not valid."}), status=400, mimetype="application/json")
  
  try:
    update_order_status_handler(id, status)
    return Response(json.dumps({"success": f"Order status was updated to: {status}."}), status=200, mimetype="application/json")
  except DBException as e:
    return Response(json.dumps({"error": e.message}), status=e.status_code, mimetype="application/json")
  except:
    return Response(json.dumps({"error": "An unexpected error occurred. Please report this issue if this continues."}), status=500, mimetype="application/json")
