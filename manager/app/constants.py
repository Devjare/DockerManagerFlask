import os

USERCONTAINERS = 'usercontainers'
USERNAME = 'username'
USERID = 'userid'

if(os.environ["DOCKER_HOST_IP"]):
    LOCALIP = os.environ["DOCKER_HOST_IP"]
else:
    LOCALIP = "unix://"
if(os.environ["PRIVATE_REGISTRY"]):
     PRIVATE_REGISTRY = ("http://" + os.environ["PRIVATE_REGISTRY"])
