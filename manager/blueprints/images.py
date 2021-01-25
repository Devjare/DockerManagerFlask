
# ************* IMAGES ******************** 
@app.route('/image_builder')
def showImageBuilder():
    return render_template('image_builder.html')

@app.route('/image_details')
def showImageDetails():
    return render_template('image_details.html')

@app.route('/images/json')
def getAllImages():
    params = request.args
    images = dockercli.images(all=True)
    return { 'images': images }

def getTagsOf(repname, source):
    url = ''
    tags = []
    if(source == 'dockerhub'):
        # FROM DOCKERHUB, TAGS CAN BE OBTAINED WITH THE FOLLOW INSTRUCTION:
        url = 'https://registry.hub.docker.com/v1/repositories/{}/tags'.format(repname)
        data = requests.get(url).json()
        for t in data:
            tags.append(t['name'])
    else: 
        # FROM LOCAL REGISTRY, TAGS ARE OBTAINED WITH:
        url = 'http://localhost:5000/v2/{}/tags/list'.format(repname)
        data = requests.get(url).json();
        tags = data['tags']

    # Return only the array of tags
    return tags

@app.route('/registry')
def getImagesFromRegistry():
    source = request.args.get('source')
    text = request.args.get('text')
    repositories = []
    if(source == 'dockerhub'):
        repositories = client.images.search(text)
    else:
        repositories = requests.get('http://localhost:5000/v2/_catalog').json()['repositories']
       
    repsWithTags = dict()
    for rep in repositories:
        if(source == 'dockerhub'):
            repsWithTags[rep['name']] = { 
                    'automated': rep['is_automated'],
                    'official': rep['is_official'],
                    'name': rep['name'],
                    'description': rep['description'],
                    'stars': rep['star_count'],
                    'tags': getTagsOf(rep['name'], str(source))
            }
        else:
            repsWithTags[rep] = getTagsOf(rep, str(source))

    return { "repositories": repsWithTags }

@app.route('/images/delete', methods=["GET"])
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

@app.route('/images/pull', methods=["GET"])
def pullImageFrom():
    repname = request.args.get('repname')
    source = request.args.get('source')
    image = client.images.pull(repname)

    imageid = ''

    if(source == 'dockerhub'):
        imageid = image.id
    else:
        imageid = image.id
 
    print('image id: ', imageid)
    return { 'id': imageid }


@app.route('/rep/<repname>/push/<id>')
def pushToRepo(repname, id):
    pass


@app.route('/images')
def listImages():
    return render_template('images.html')


def addContainerToUser(idcontainer):
    print('adding: ', idcontainer)
    print('to user: ', session[USERNAME])
    userContainer = UsersContainers(session[USERID], idcontainer)
    db.session.add(userContainer)
    db.session.commit()

@app.route('/images/inspect', methods=["GET"])
def getImageInfo():
    id = request.args['id']
    image = {}
    try:
        image = dockercli.inspect_image(id)
    except docker.errors.APIError as err:
        return { "error": str(err) }
    return {"image": image} 

