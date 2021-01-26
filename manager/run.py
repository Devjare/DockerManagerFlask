import sys
import datetime
import simplejson as json
import os
from blueprints import images, containers, services, login
from config import USERID, USERNAME, USERCONTAINERS, app

app.register_blueprint(images.images_bp, url_prefix="/images")
app.register_blueprint(containers.containers_bp, url_prefix="/containers")
app.register_blueprint(services.services_bp)
app.register_blueprint(login.login_bp)

# only to load containers on database, test purposes.s
@app.route('/loadDatabase')
def loadDatabase():
    allcontainers = client.containers.list(all=True)
    
    for c in allcontainers:
        print('container: ', c)
        containers = Container.query.all()
        new_container = Container(c.id, c.name, c.image.id)
        db.session.add(new_container)
        db.session.commit()

    return 'Containers loaded into DB!'

@app.route('/testdb')
def testdb():
    data = db.session.query( Container, User ).filter(
            UsersContainers.container_id == Container.id,
            UsersContainers.user_id == User.uid).order_by(UsersContainers.user_id).all();

    return {'data': data} 


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("usage: %s port" % (sys.argv[0]))
        sys.exit(-1)

    p = int(sys.argv[1])
    print("start at port %s" % (p))
    app.run(host='0.0.0.0', port=p, debug=True, threaded=True)

