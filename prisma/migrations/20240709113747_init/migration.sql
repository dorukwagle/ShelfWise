-- CreateTable
CREATE TABLE `MembershipTypes` (
    `membershipTypeId` VARCHAR(191) NOT NULL,
    `type` ENUM('Staff', 'Faculty', 'Tutor') NOT NULL,
    `precedence` INTEGER NOT NULL,

    PRIMARY KEY (`membershipTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoles` (
    `roleId` VARCHAR(191) NOT NULL,
    `role` ENUM('Member', 'Coordinator', 'AssistantManager', 'Manager') NOT NULL,
    `precedence` INTEGER NOT NULL,

    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `contactNo` VARCHAR(191) NULL,
    `profilePicUrl` VARCHAR(1000) NULL,
    `accountCreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enrollmentYear` DATETIME(3) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Others') NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `membershipId` VARCHAR(191) NOT NULL,
    `roll_number` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `accountStatus` ENUM('Pending', 'Active', 'Inactive', 'Rejected', 'Suspended') NOT NULL DEFAULT 'Pending',
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,

    UNIQUE INDEX `Users_roll_number_key`(`roll_number`),
    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Memberships` (
    `membershipId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `membershipTypeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`membershipId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookRequests` (
    `requestId` VARCHAR(191) NOT NULL,
    `bookName` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `status` ENUM('Pending', 'Noted', 'Resolved') NOT NULL DEFAULT 'Pending',
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifications` (
    `notificationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(2050) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`notificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penalties` (
    `penaltyId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('Pending', 'Resolved') NOT NULL,
    `penaltyType` ENUM('PropertyDamage', 'Overdue') NOT NULL DEFAULT 'Overdue',
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`penaltyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payments` (
    `paymentId` VARCHAR(191) NOT NULL,
    `amountPaid` DOUBLE NOT NULL,
    `paymentType` ENUM('Membership', 'Penalty') NOT NULL DEFAULT 'Membership',
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookInfo` (
    `bookInfoId` VARCHAR(191) NOT NULL,
    `classNumber` VARCHAR(191) NOT NULL,
    `bookNumber` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subTitle` VARCHAR(191) NULL,
    `editionStatement` VARCHAR(191) NULL,
    `numberOfPages` BIGINT NOT NULL,
    `publicationYear` DATE NOT NULL,
    `seriesStatement` VARCHAR(191) NULL,
    `addedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `coverPhoto` VARCHAR(2050) NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `publisherId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BookInfo_classNumber_key`(`classNumber`),
    UNIQUE INDEX `BookInfo_bookNumber_key`(`bookNumber`),
    FULLTEXT INDEX `BookInfo_title_subTitle_idx`(`title`, `subTitle`),
    PRIMARY KEY (`bookInfoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Authors` (
    `authorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    FULLTEXT INDEX `Authors_fullName_idx`(`fullName`),
    PRIMARY KEY (`authorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookWithAuthors` (
    `bookAuthorId` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,

    PRIMARY KEY (`bookAuthorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publishers` (
    `publisherId` VARCHAR(191) NOT NULL,
    `publisherName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`publisherId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `isbns` (
    `isbnId` VARCHAR(191) NOT NULL,
    `isbn` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,

    UNIQUE INDEX `isbns_isbn_key`(`isbn`),
    PRIMARY KEY (`isbnId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Genres` (
    `genreId` VARCHAR(191) NOT NULL,
    `genre` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Genres_genre_idx`(`genre`),
    PRIMARY KEY (`genreId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookWithGenres` (
    `bookGenreId` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `genreId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,

    PRIMARY KEY (`bookGenreId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Books` (
    `bookId` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NOT NULL,
    `status` ENUM('Available', 'Reserved', 'Issued') NOT NULL DEFAULT 'Available',
    `damagedOn` DATE NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Books_barcode_key`(`barcode`),
    INDEX `Books_barcode_idx`(`barcode`),
    PRIMARY KEY (`bookId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookPurchases` (
    `purchaseId` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `pricePerPiece` DOUBLE NOT NULL,
    `totalPieces` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`purchaseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Issues` (
    `issueId` VARCHAR(191) NOT NULL,
    `checkInDate` DATETIME(3) NOT NULL,
    `checkOutDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `renewalRequestedAt` DATETIME(3) NULL,
    `renewalRequest` BOOLEAN NOT NULL DEFAULT false,
    `renewalCount` INTEGER NOT NULL DEFAULT 0,
    `bookId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `issuedBy` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`issueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookReservations` (
    `reservationId` VARCHAR(191) NOT NULL,
    `reservationDate` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('Pending', 'Cancelled', 'Confirmed', 'Resolved') NOT NULL DEFAULT 'Pending',
    `bookId` VARCHAR(191) NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`reservationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnlineBooks` (
    `onlineBookId` VARCHAR(191) NOT NULL,
    `purchaseUrl` VARCHAR(2050) NULL,
    `filePath` VARCHAR(1000) NULL,
    `title` VARCHAR(191) NOT NULL,
    `coverPhoto` VARCHAR(1000) NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`onlineBookId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comments` (
    `commentId` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(10000) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentReplies` (
    `commentReplyId` VARCHAR(191) NOT NULL,
    `reply` VARCHAR(10000) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`commentReplyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ratings` (
    `ratingId` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` TINYINT NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`ratingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookRatingScore` (
    `bookRatingScoreId` VARCHAR(191) NOT NULL,
    `bookInfoId` VARCHAR(191) NOT NULL,
    `score` FLOAT NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`bookRatingScoreId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributes` (
    `globalAttributeId` VARCHAR(191) NOT NULL,
    `penaltyPerDay` DOUBLE NOT NULL,
    `membershipValidationMonths` INTEGER NOT NULL,
    `issueValidityDays` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`globalAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sessions` (
    `sessionId` BIGINT NOT NULL AUTO_INCREMENT,
    `session` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` TIMESTAMP(3) NOT NULL,

    UNIQUE INDEX `Sessions_session_key`(`session`),
    PRIMARY KEY (`sessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `UserRoles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `Memberships`(`membershipId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Memberships` ADD CONSTRAINT `Memberships_membershipTypeId_fkey` FOREIGN KEY (`membershipTypeId`) REFERENCES `MembershipTypes`(`membershipTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookRequests` ADD CONSTRAINT `BookRequests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifications` ADD CONSTRAINT `Notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penalties` ADD CONSTRAINT `Penalties_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookInfo` ADD CONSTRAINT `BookInfo_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publishers`(`publisherId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookWithAuthors` ADD CONSTRAINT `BookWithAuthors_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `Authors`(`authorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookWithAuthors` ADD CONSTRAINT `BookWithAuthors_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `isbns` ADD CONSTRAINT `isbns_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookWithGenres` ADD CONSTRAINT `BookWithGenres_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookWithGenres` ADD CONSTRAINT `BookWithGenres_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `Genres`(`genreId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Books` ADD CONSTRAINT `Books_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookPurchases` ADD CONSTRAINT `BookPurchases_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Issues` ADD CONSTRAINT `Issues_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Books`(`bookId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Issues` ADD CONSTRAINT `Issues_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookReservations` ADD CONSTRAINT `BookReservations_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Books`(`bookId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookReservations` ADD CONSTRAINT `BookReservations_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentReplies` ADD CONSTRAINT `CommentReplies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentReplies` ADD CONSTRAINT `CommentReplies_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comments`(`commentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ratings` ADD CONSTRAINT `Ratings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ratings` ADD CONSTRAINT `Ratings_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookRatingScore` ADD CONSTRAINT `BookRatingScore_bookInfoId_fkey` FOREIGN KEY (`bookInfoId`) REFERENCES `BookInfo`(`bookInfoId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sessions` ADD CONSTRAINT `Sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
