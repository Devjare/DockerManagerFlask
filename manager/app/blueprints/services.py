from flask import Blueprint, render_template

services_bp = Blueprint("services", __name__, static_folder="url_for('static')", template_folder="url_for('templates')")

images = {
    "name": "http://localhost:5000",
    "endpoint": "/v2/_catalog",
    "children": []
}

@services_bp.route('/home')
def main():
    return render_template('index.html')

@services_bp.route('/health')
def health():
    return 'El gestor global es saludable'

# Interfaz grafica
@services_bp.route('/silo')
def silo():
    headers = getForwardHeaders(request)
    user = request.cookies.get("user", "")
    (siloStatus, images) = getSilo(headers)
    return render_template(
        'silo.html',
        siloStatus=siloStatus,
        images=images,
        user=user)


@services_bp.route('/unidades')
def units():
    return render_template(
        'uc.html')


@services_bp.route('/subservicios')
def subservices():
    return render_template(
        'sv.html')


@services_bp.route('/definicion')
def planning():
    headers = getForwardHeaders(request)
    user = request.cookies.get("user", "")
    (siloStatus, images) = getSilo(headers)
    return render_template(
        'planificacion.html',
        siloStatus=siloStatus,
        images=images,
        user=user)


@services_bp.route('/representacion')
def picture():
    return render_template(
        'planificacion.html')


@services_bp.route('/despliegue')
def deployment():
    return render_template(
        'planificacion.html')


@services_bp.route('/acoplamiento')
def coupling():
    return render_template(
        'planificacion.html')

# Obtengo las images del SILO
@services_bp.route('/api/v1/images')
def getImages():
    return json.dumps(getImagesSilo()), 200, {'Content-Type': 'application/json'}

# Funciones llamadas por el API

def getForwardHeaders(request):
    headers = {}

    user_cookie = request.cookies.get("user")
    if user_cookie:
        headers['Cookie'] = 'user=' + user_cookie

    incoming_headers = ['x-request-id',
                        'x-b3-traceid',
                        'x-b3-spanid',
                        'x-b3-parentspanid',
                        'x-b3-sampled',
                        'x-b3-flags',
                        'x-ot-span-context'
                        ]

    for ihdr in incoming_headers:
        val = request.headers.get(ihdr)
        if val is not None:
            headers[ihdr] = val

    return headers


def getSilo(headers):
    try:
        url = images['name'] + images['endpoint']
        res = requests.get(url, headers=headers, timeout=3.0)
    except:
        res = None
    if res and res.status_code == 200:
        return (200, res.json())
    else:
        status = (res.status_code if res != None and res.status_code else 500)
        return (status, {'error': 'Lo sentimos, las unidades de construccion no estan disponible en este momento.'})


def getImagesSilo():
    try:
        url = images['name'] + "/" + images['endpoint']
        res = requests.get(url, timeout=3.0)
    except:
        res = None
    if res and res.status_code == 200:
        return res.json()
    else:
        return ({'error': 'Lo sentimos, las unidades de construccion no estan disponible en este momento.'})


##### API #####

# Crea un servicio
@services_bp.route("/api/v1/service/create/", methods=["POST"])
def add_service():
    
    id = request.json['id']
    name = request.json['name']
    image = request.json['image']
    replicas = request.json['replicas']
    
    new_service = Service(id, name, image, replicas)
    
    db.session.add(new_service)
    db.session.commit()
    
    return jsonify({"message": "Created new service.",
                    "id": new_service.id})

# Obtiene los servicios


@services_bp.route("/api/v1/services/", methods=["GET"])
def get_services():
    all_services = Service.query.all()
    result = services_schema.dump(all_services)
    return jsonify({"services": result.data})

# Obtiene la informacion de un servicio


@services_bp.route("/api/v1/service/<id>", methods=["GET"])
def service_detail(id):
    service = Service.query.get(id)
    #result = service_schema.dump(service)
    #return jsonify(result)
    return service_schema.jsonify(service)

# Elimina un servicio
@services_bp.route("/api/v1/service/<id>", methods=["DELETE"])
def service_delete(id):
    service = Service.query.get(id)
    db.session.delete(service)
    db.session.commit()

    #service = client.services.get(id)
    #service.remove()
    return jsonify({"message": "Deleted service.",
                    "id": id})

# Registro de UC
@services_bp.route("/api/v1/register/", methods=["POST"])
def add_uc():
    id = request.json['id']
    name = request.json['name']
    host = request.json['host']
    
    new_piece = Piece(id, name, host)
    
    db.session.add(new_piece)
    db.session.commit()
    
    return jsonify({"message": "Register new UC.",
                    "id": new_piece.id})


@services_bp.route("/api/v1/uc/")
def get_uc():
    pieces = Piece.query.all()
    result = piece_schema.dump(pieces)
    return jsonify({"ucs": result.data})
