# Compatibility Game

## Getting Started
Start the local server:
```
chmod +x setup.sh
./setup.sh && bin/www
```

Run the client:
```
chmod +x setup.sh
./setup.sh && ./client.js <poser|solver>
```

## API

All the response contains a boolean field `success`.

### Snag a contest
```
Method: GET
Path: /api/create
Query Parameters:
	date1
	date2
	date3
	numpackages
	numversions
	numcompatibles
```
### Register for a contest
```
Method: GET
Path: /api/register
Query Parameters:
	id
	name
```
### Retrieve a problem
```
Method: GET
Path: /api/get
Query Parameters:
	id
	pid
	role
	code
```
If successful, the response contains a field `data`.
### Submit a problem/solution
```
Method: POST
Path: /api/submit
Query Parameters:
	id
	pid
	role
	code
Request Data:
	data
```
