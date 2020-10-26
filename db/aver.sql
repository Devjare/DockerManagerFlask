PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE systems (
    id bigint PRIMARY KEY NOT NULL,
    version integer NOT NULL,
    name text NOT NULL,
    status character(1) DEFAULT '1' NOT NULL,
    created_at DATE DEFAULT (datetime('now','localtime'))
);
CREATE TABLE objects (id integer primary key autoincrement, code text not null, unique(code) on conflict ignore);
CREATE TABLE relations (src int not null, name text not null, dst int not null, unique(src, name, dst) on conflict ignore, foreign key(src) references objects(id), foreign key(dst) references objects(id));
CREATE TABLE environments ( id integer primary key autoincrement, env text not null, container_id text, status character(1) default '1' not null, created_at date default(datetime('now', 'localtime')));
CREATE TABLE ports ( id integer primary key autoincrement, port text not null, container_id text, status character(1) default '1' not null, created_at date default (datetime('now','localtime')));
CREATE TABLE groups (
id bigint primary key not null,
name text not null,
status character(1) default '1' not null,
  created_at date default (datetime('now','localtime'))
);
INSERT INTO "groups" VALUES(1,'access','1','2018-03-11 01:34:15');
INSERT INTO "groups" VALUES(2,'management','1','2018-03-11 01:34:23');
INSERT INTO "groups" VALUES(3,'data','1','2018-03-11 01:34:31');
CREATE TABLE IF NOT EXISTS "services" (
	`id`	text,
	`name`	text NOT NULL,
	`image`	text NOT NULL,
	`replicas`	integer NOT NULL,
	`status`	character(1) NOT NULL DEFAULT '1',
	`created_at`	date DEFAULT (datetime('now','localtime')),
	PRIMARY KEY(id)
);
INSERT INTO services VALUES('','db_metadata','127.0.0.1:5000/db_metadata:v1',1,'1','2018-08-03 02:11:05');
INSERT INTO services VALUES('1','db_fileskycds','127.0.0.1:5000/ggausin/db_fileskycds:2.2',1,'1','2018-08-21 10:08:44');
CREATE TABLE IF NOT EXISTS "pieces" (
	`id`	INTEGER,
	`name`	text NOT NULL,
	`host`	text NOT NULL,
	`status`	character(1) NOT NULL DEFAULT '1',
	`created_at`	date DEFAULT (datetime('now','localtime')),
	PRIMARY KEY(id)
);
INSERT INTO pieces VALUES(1,'storage1','10.0.0.5','1','2018-07-24 12:01:46');
INSERT INTO pieces VALUES(2,'storage2','10.0.0.3','1','2018-07-24 12:10:43');
INSERT INTO pieces VALUES(3,'storage3','10.0.0.6','1','2018-07-24 12:10:43');
INSERT INTO pieces VALUES(4,'storage4','10.0.0.4','1','2018-07-24 12:10:43');
INSERT INTO pieces VALUES(5,'storage5','10.0.0.7','1','2018-07-24 12:10:43');
INSERT INTO pieces VALUES(6,'metadata','10.0.0.8','1','2018-07-24 12:29:52');
INSERT INTO pieces VALUES(7,'database','10.0.0.9','1','2018-07-24 12:31:43');
DELETE FROM sqlite_sequence;
COMMIT;
