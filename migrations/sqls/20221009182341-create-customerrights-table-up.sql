CREATE TABLE `customerrights` (
  `Id` INT NOT NULL auto_increment primary key,
  `UserId` varchar(50) NOT NULL,
  `CustomerId` varchar(50) NOT NULL,
  `CreateDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1
