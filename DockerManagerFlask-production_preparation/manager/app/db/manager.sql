CREATE TABLE if not exists systems (
  id bigint primary key not null,
  version integer not null,
  name text not null,
  status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);

CREATE TABLE if not exists groups (
	id bigint primary key not null,
	name text not null,
	status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS environments (
  id integer primary key autoincrement,
  env text not null,
  container_id text,
  status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS ports (
  id integer primary key autoincrement,
  port text not null,
  container_id text,
  status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);

CREATE TABLE if not exists containers (
  id text primary key,
  name text not null,
  image text not null,
  replicas integer not null,
  status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);

CREATE TABLE if not exists microservices (
  id integer primary key autoincrement,
  name text not null,
  tag text not null,
  port integer not null,
  group_id integer not null,
  status character(1) default '1' not null,
  created_at date default (datetime('now','localtime')),
  foreign key(group_id) references groups(id)
);

CREATE TABLE if not exists applications (
  id integer primary key autoincrement,
  name text not null,
  tag text not null,
  image text not null,
  host text not null,
  port integer not null,
  input text not null,
  through text not null,
  output text not null,
  layer_id integer not null,
  system_id integer not null,
  status character(1) default '1' not null,
  created_at DATE default (datetime('now','localtime')),
  foreign key(layer_id) references layers(id),
  foreign key(system_id) references systems(id)
);

CREATE TABLE if not exists pieces (
  id integer primary key,
  name text not null,
  host text not null,
  status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);


CREATE TABLE if not exists objects (
  id integer primary key autoincrement, 
  code text not null, 
  unique(code) on conflict ignore
);

CREATE TABLE if not exists relations (
  src int not null, 
  name text not null, 
  dst int not null,
  unique(src, name, dst) on conflict ignore,
  foreign key(src) references objects(id),
  foreign key(dst) references objects(id)
);

#store item
INSERT into objects (code) values (?);

#delete item
DELETE from objects where code = ?;

#replace_item
UPDATE objects set code = ? where code = ?;

SELECT id from objects where code = ? limit 1;

#store_relation
INSERT into relations (name, src, dst) values (?,?,?);

#delete_single_relation
DELETE from relations where src = ? and name = ? and dst = ?;

#find
SELECT code from objects where id in (select dst from relations where src = ? and name = ?)

#relations_of
SELECT name, (select code from objects where id = dst) from relations where src = ?;

SELECT distinct name from relations where src = ?;

#relations_to
SELECT name, (select code from objects where id = src) from relations where dst = ?;

SELECT distinct name from relations where dst = ?;

#list_objects
SELECT * from objects;

#list_relations
SELECT * from relations;

