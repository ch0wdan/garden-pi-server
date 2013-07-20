/** MySQL Script to create the garden_pi 
    databases and required tables. **/

delimiter $$

CREATE DATABASE `garden_pi` /*!40100 DEFAULT CHARACTER SET utf8 */;$$

delimiter $$

USE garden_pi;$$

delimiter $$

CREATE TABLE `crop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_location` int(11) NOT NULL,
  `plant_date` datetime NOT NULL,
  `name` varchar(45) NOT NULL,
  `desc` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `garden` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_location` int(11) NOT NULL,
  `id_crop` int(11) DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `desc` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `garden_sensor_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_garden` int(11) NOT NULL,
  `id_sensor_role` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `location_sensor_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_location` int(11) NOT NULL,
  `id_sensor_role` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sensor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_sensor_type` int(11) NOT NULL,
  `id_location_sensor_role` int(11) DEFAULT NULL,
  `id_garden_sensor_role` int(11) DEFAULT NULL,
  `serial_number` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number_UNIQUE` (`serial_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sensor_reading` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_sensor` int(11) NOT NULL,
  `id_location_sensor_role` int(11) DEFAULT NULL,
  `id_garden_sensor_role` int(11) DEFAULT NULL,
  `id_crop` int(11) DEFAULT NULL,
  `reading_value` decimal(15,5) DEFAULT NULL,
  `reading_instant` datetime NOT NULL,
  `reading_data` mediumblob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=486 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sensor_reading_orphaned` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serial_number` varchar(255) NOT NULL,
  `reading_value` decimal(15,5) DEFAULT NULL,
  `reading_instant` datetime NOT NULL,
  `reading_data` mediumblob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sensor_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `desc` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `sensor_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  `uom_name` varchar(45) NOT NULL,
  `uom_symbol` varchar(25) NOT NULL,
  `device_product` varchar(45) NOT NULL,
  `device_name` varchar(45) NOT NULL,
  `device_desc` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `id_location_default` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `user_location_permission` (
  `id_user` int(11) NOT NULL,
  `id_location` int(11) NOT NULL,
  PRIMARY KEY (`id_user`,`id_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

