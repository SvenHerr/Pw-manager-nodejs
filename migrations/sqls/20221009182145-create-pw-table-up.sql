CREATE TABLE `pw` (
    `Username` varchar(256) COLLATE utf8_bin DEFAULT NULL,
    `Name` varchar(256) COLLATE utf8_bin DEFAULT NULL,
    `Pw` varchar(256) COLLATE utf8_bin DEFAULT NULL,
    `CreateDate` date DEFAULT NULL,
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Loginname` varchar(256) COLLATE utf8_bin DEFAULT NULL,
    `CustomerId` varchar(50) NOT NULL) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_bin
