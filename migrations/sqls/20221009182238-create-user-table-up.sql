CREATE TABLE `user` (
  `Id` INT NOT NULL auto_increment primary key,
  `Username` varchar(50) NOT NULL,
  `Firstname` varchar(50) NOT NULL,
  `Lastname` varchar(50) NOT NULL,
  `CreateDate` date NOT NULL,
  `Pw` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1
