import os

USERCONTAINERS = 'usercontainers'
USERNAME = 'username'
USERID = 'userid'

<<<<<<< HEAD
=======
# disys0.tamps.cinvestav.mx:2375 <-- IP Servidor
#LOCALIP = "unix://var/run/docker.sock"
>>>>>>> andres-frontend
if(os.environ["DOCKER_HOST_IP"]):
    LOCALIP = os.environ["DOCKER_HOST_IP"]
else:
    LOCALIP = "unix://"
if(os.environ["PRIVATE_REGISTRY"]):
     PRIVATE_REGISTRY = ("http://" + os.environ["PRIVATE_REGISTRY"])
