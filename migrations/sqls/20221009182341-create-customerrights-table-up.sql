CREATE TABLE `customerrights` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `UserId` varchar(50) NOT NULL,
    `CustomerId` varchar(50) NOT NULL,
    `CreateDate` date NOT NULL) ENGINE = InnoDB DEFAULT CHARSET = latin1
