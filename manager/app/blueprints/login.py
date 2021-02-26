from flask import Blueprint, render_template, request, session
from app import dockercli, client, db
from app.constants import USERID, USERNAME, USERCONTAINERS
from app.db_models import User, Container, UsersContainers

login_bp = Blueprint("login", __name__, static_folder="url_for('static')", template_folder="url_for('templates')")

@login_bp.route('/', methods=['GET'])
def loginscreen():
    return render_template('login/login.html')

@login_bp.route('/logout', methods=['GET'])
def logout():
    try:
        [session.pop(key) for key in list(session.keys())]
    except Exception as e:
        return { 'error': e }

    return { 'success': True } 

@login_bp.route('/login', methods=['POST'])
def login():
    params = request.json;
    
    if(len(params) > 0):
        # authenticate
        username = params.get('username')
        password = params.get('password')

        exists = authenticate(username, password)
        if(exists): 
            session[USERNAME] = username

            userContainers = db.session.query(Container, User).filter(
                    UsersContainers.container_id == Container.id,
                    UsersContainers.user_id == User.uid).order_by(UsersContainers.user_id).all()
            session[USERCONTAINERS] = []
            for x in userContainers:
                session[USERCONTAINERS].append(x.Container.id)

            return { 'login': True }
        else:
            return { 'error': 'User does not exist' } 

    return { 'error': 'An error occurred, failed to authenticate.' } 

def authenticate(username, password):
    allusers = User.query.all()
    for user in allusers:
        if(user.username == username and user.password == password):
            session[USERID] = user.uid
            return True
    
    return False

@login_bp.route('/signup', methods=['POST'])
def signup():
    params = request.json;
    
    if(len(params) > 0):
        # authenticate
        username = params.get('username')
        password = params.get('password')

        exists = authenticate(username, password)
        if(exists):
            return { 'error': 'User already exists, login instead'}
        else:
            session[USERNAME] = username
            # insert to db user, and login
            user = User(username, password)
            
            db.session.add(user)
            db.session.commit()
            return { 'signup': True } 
    
    return { 'error': 'An error occurred, failed to authenticate.' } 
