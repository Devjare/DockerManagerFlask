from flask import Blueprint, render_template, session, request
from app import dockercli, client, db
from app.db_models import User
from app.constants import USERID, USERNAME
import requests
import simplejson as json
import docker

settings_bp = Blueprint("settings", __name__, static_folder="url_for('static')", template_folder="url_for('templates')")

@settings_bp.route('/')
def general():
    return render_template('settings.html')


@settings_bp.route('/newusername', methods=["POST"])
def changeUsername():
    data = request.json
    currentUser = User.query.get(session[USERID])
    if(currentUser != None):
        try:
            currentUser.username = data['newUsername']
            db.session.commit()
        except Exception as ex:
            print("An error occurred trying to update user's 'username'. Error: ", str(ex))
            return { 'error': 'An unexpected error occurred. Check server logs!' }
        session[USERNAME] = data['newUsername']
    else:
        return { 'error': 'The specified user could not be found on database. Try login again.' }
    return { 'success': 'Username updated succesfully!' }

@settings_bp.route('/newpassword', methods=["POST"])
def changePassword():
    data = request.json
    currentUser = User.query.get(session[USERID])
    currentPassword = data['currentPassword']
    newPassword = data['newPassword']

    if(currentUser != None):
        if(isCurrentPasswordValid(currentPassword, currentUser)):
            try:
                currentUser.password = data['newPassword']
                db.session.commit()
            except Exception as ex:
                print("An error occurred trying to update user's 'password'. Error: ", str(ex))
                return { 'error': 'An unexpected error occurred. Check server logs!' }
        else:
            return { 'error': 'Incorrect current password!' }
    else:
        return { 'error': 'The specified user could not be found on database. Try login again.' }


    return { 'success': 'Password updated succesfully.' }

def isCurrentPasswordValid(currentPassword, currentUser):
    return currentPassword == currentUser.password 
