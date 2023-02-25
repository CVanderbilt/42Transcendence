#!/bin/bash

CONTAINER_NAME=transcendence
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker run --name $CONTAINER_NAME  -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -e POSTGRES_DB=ft_transcendence --publish  127.0.0.1:5432:5432 postgres 
