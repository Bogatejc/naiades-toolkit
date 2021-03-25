from flask import Flask, request, json, jsonify, Response
import requests

api = Flask(__name__)
baseUrl = 'http://5.53.108.182:8668/v2'

@api.route('/ping', methods=['GET'])
def ping():
    res = jsonify({'message':'Pong!'})
    res.headers.add('Access-Control-Allow-Origin', '*')
    return res

@api.route('/pingApi', methods=['GET'])
def pingApi():
    r = requests.get(baseUrl + '/health')
    res = None
    if(r.status_code != requests.codes.ok):
        res = jsonify({'status': 'Fail'})
        res.headers.add('Access-Control-Allow-Origin', '*')
        return res
    else:
        body = r.json()
        if(body['status'] == 'pass'):
            res = jsonify({'status': 'Pass'})
        else:
            res = jsonify({'status': 'Fail'})
        res.headers.add('Access-Control-Allow-Origin', '*')
        return res

@api.route('/entitySummary', methods=['GET'])
def getEntitySummary():
    dict_ = {
        'http_status': None,
        'first_date': None,
        'sample_count': None,
        'last_date': None,
        'sample_json': None
    }

    headers = {
        "Fiware-Service": request.args.get('service'),
        "Fiware-ServicePath": "/",
        "Content-Type": "application/json"
    }

    r = requests.get(baseUrl + "/entities/" + request.args.get('entityId') + '?limit=1', headers=headers)
    if(r.status_code != requests.codes.ok):
        dict_['http_status'] = r.status_code
        dict_['sample_json'] = r.json()
        res = jsonify(dict_)
        res.headers.add('Access-Control-Allow-Origin', '*')
        return res
    else:
        body = r.json()
        dict_['http_status'] = 200
        dict_['first_date'] = body['index'][0]
        attribute_name = body['attributes'][0]['attrName']
        r = requests.get(baseUrl + "/entities/" + request.args.get('entityId') + '?attrs=' + attribute_name + '&aggrMethod=count', headers=headers)
        if(r.status_code == requests.codes.ok):
            body = r.json()
            dict_['sample_count'] = body['attributes'][0]['values'][0]
        r = requests.get(baseUrl + "/entities/" + request.args.get('entityId') + '?lastN=1', headers=headers)
        if(r.status_code == requests.codes.ok):
            body = r.json()
            dict_['last_date'] = body['index'][0]
            dict_['sample_json'] = body

        res = jsonify(dict_)
        res.headers.add('Access-Control-Allow-Origin', '*')

        return res

if __name__ == '__main__':
    api.run(port=5004)