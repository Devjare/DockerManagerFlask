import os
# CONSTANTS
USERCONTAINERS = 'usercontainers'
USERNAME = 'username'
USERID = 'userid'

# disys0.tamps.cinvestav.mx:2375 <-- IP Servidor
#LOCALIP = "unix://var/run/docker.sock"
LOCALIP = os.environ["DOCKER_HOST_IP"]
PRIVATE_REGISTRY = os.environ["PRIVATE_REGISTRY"] 
