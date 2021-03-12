from flask import Blueprint, render_template, request, redirect, url_for
from app import dockercli, client
from app.constants import PRIVATE_REGISTRY 
import requests
import docker
from werkzeug.utils import secure_filename
import zipfile

images_bp = Blueprint("images", __name__, static_folder="url_for('static')", template_folder="url_for('templates')")

# Routes
@images_bp.route('/')
@images_bp.route('/images')
def listImages():
    return render_template('images/list.html')

@images_bp.route('/builder')
def showImageBuilder():
    return render_template('images/builder.html')

@images_bp.route('/details')
def showImageDetails():
    return render_template('images/details.html')

# utils

@images_bp.route('/json')
def getAllImages():
    images = dockercli.images()
    return { 'images': images }

def getTagsOf(repname, source):
    url = ''
    tags = []
    if(source == 'dockerhub'):
        # FROM DOCKERHUB, TAGS CAN BE OBTAINED WITH THE FOLLOW INSTRUCTION:
        url = 'https://registry.hub.docker.com/v1/repositories/{}/tags'.format(repname)
        try:
            data = requests.get(url).json()
        except Exception as err:
            return { 'error': str(err) }

        for t in data:
            tags.append(t['name'])
    else: 
        # FROM LOCAL REGISTRY, TAGS ARE OBTAINED WITH:
        url = (PRIVATE_REGISTRY + '/v2/{}/tags/list').format(repname)
        try:
            data = requests.get(url).json();
        except Exception as err:
            return { 'error': str(err) }
        tags = data['tags']

    # Return only the array of tags
    return tags

@images_bp.route('/registry')
def getImagesFromRegistry():
    source = request.args.get('source')
    text = request.args.get('text')
    repositories = []
    if(source == 'dockerhub'):
        try:
            repositories = client.images.search(text)
        except docker.errors.APIError as err:
            return { 'error': str(err) }
    else:
        try:
            repositories = requests.get(PRIVATE_REGISTRY + '/v2/_catalog').json()['repositories']
        except Exception as err:
            return { 'error': str(err) }
       
    repsWithTags = dict()
    for rep in repositories:
        if(source == 'dockerhub'):
            try:
                repsWithTags[rep['name']] = { 
                        'automated': rep['is_automated'],
                        'official': rep['is_official'],
                        'name': rep['name'],
                        'description': rep['description'],
                        'stars': rep['star_count'],
                        'tags': getTagsOf(rep['name'], str(source))
                }
            except Exception as err:
                print('Failed to load tags, error: ', str(err))
                return { 'error': 'Failed to get tags of repositories.' }
        else:
            try:
                repsWithTags[rep] = getTagsOf(rep, str(source))
            except Exception as err:
                print('Failed to load tags, error: ', str(err))
                return { 'error': 'Failed to get tags of repositories.' }

    return { "repositories": repsWithTags }

@images_bp.route('/delete', methods=["GET"])
def deleteImage():
    image = request.args.get('imagerepo')
    force = request.args.get('force') == 'true'
    noprune = request.args.get('noprune') == 'true' 
    msg = 'deleted'
    try: 
        client.images.remove(image=image, force=force, noprune=noprune) 
    except docker.errors.APIError as err:
        return { "error": str(err) }
    return { 'success': True }

@images_bp.route('/pull', methods=["GET"])
def pullImageFrom():
    repname = request.args.get('repname')
    source = request.args.get('source')
    image = client.images.pull(repname)

    imageid = ''

    if(source == 'dockerhub'):
        imageid = image.id
    else:
        imageid = image.id
 
    return { 'id': imageid }


@images_bp.route('/inspect', methods=["GET"])
def getImageInfo():
    id = request.args['id']
    image = {}
    try:
        image = dockercli.inspect_image(id)
    except docker.errors.APIError as err:
        return { "error": str(err) }
    return {"image": image} 

@images_bp.route('/build', methods=["POST"])
def buildImage():
    print('parameters form: ', request.form)
    f = request.files['file'].read() 
    args = request.form
    
    try:
        client.images.build(
                # path = args['path'] if 'path' in data else None, 
                tag = args['tag'] if 'tag' in args else None, 
                fileobj=f, 
                custom_context=True,
                dockerfile = args['dockerfile'] if 'dockerfile' in args else None,
                quiet = (args['quiet'] == 'on') if 'quiet' in args else None, 
                nocache = (args['quiet'] == 'on') if 'quiet' in args else None,
                timeout = args['timeout'] if 'timeout' in args else None,
                encoding = args['encodig'] if 'encodig' in args else None,
                buildargs = args['buildargs'] if 'buildargs' in args else None,
                container_limits = args['containerLimits'] if 'containerLimits' in args else None,
                shmsize = args['shmsize'] if 'shmsize' in args else None,
                labels = args['labels'] if 'labels' in args else None,
                cache_from = args['cacheFrom'] if 'cacheFrom' in args else None,
                target = args['target'] if 'target' in args else None,
                network_mode = args['networkMode'] if 'networkMode' in args else None,
                extra_hosts = args['extraHosts'] if 'extraHosts' in args else None,
                platform = args['platform'] if 'platform' in args else None,
                isolation = args['isolation'] if 'isolation' in args else None,
                rm = (args['rm'] == 'on') if 'rm' in args else None,
                squash = (args['squash'] == 'on') if 'squash' in args else None,
                use_config_proxy = (args['useConfigProxy'] == 'on') if 'useConfigProxy' in args else None,
                )
    except docker.errors.BuildError as berr:
        error = { 'error': str(berr) }
        return render_template('/images/builder.html', error=error)
    except docker.errors.APIError as apierr:
        error = { 'error': str(apierr) }
        return render_template('/images/builder.html', error=error)

    return render_template('/images/list.html')
