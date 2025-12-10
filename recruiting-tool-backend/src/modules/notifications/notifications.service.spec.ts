import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SseService } from '../sse/sse.service';
import {
  CreateNotificationDto,
  GetNotificationsQueryDto,
} from './dto';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let databaseService: DatabaseService;
  let sseService: SseService;

  const mockUser = {
    id: 1,
    uid: 'user-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    roles: ['HR'],
    companyId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastLogin: null,
    company: {
      id: 1,
      uid: 'company-uid-123',
      name: 'Test Company',
      description: 'Test company',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  };

  const mockNotification = {
    id: 1,
    uid: 'notif-uid-123',
    userId: 1,
    type: NotificationType.INTERVIEW_SCHEDULED,
    title: 'Interview Scheduled',
    message: 'Your interview has been scheduled for tomorrow',
    isRead: false,
    metadata: { interviewUid: 'interview-uid-123' },
    createdAt: new Date(),
    readAt: null,
    user: {
      uid: 'user-uid-123',
      company: { uid: 'company-uid-123' },
    },
  };

  const mockDatabaseService = {
    user: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockSseService = {
    emitNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: SseService, useValue: mockSseService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    sseService = module.get<SseService>(SseService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const createDto: CreateNotificationDto = {
        userUid: 'user-uid-123',
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview Scheduled',
        message: 'Your interview has been scheduled for tomorrow',
        metadata: { interviewUid: 'interview-uid-123' },
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.create.mockResolvedValue(mockNotification);
      mockSseService.emitNotification.mockReturnValue(undefined);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('uid', mockNotification.uid);
      expect(result).toHaveProperty('title', mockNotification.title);
      expect(result).toHaveProperty('message', mockNotification.message);
      expect(result).toHaveProperty('type', mockNotification.type);
      expect(result).toHaveProperty('isRead', false);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { uid: 'user-uid-123' },
      });
      expect(databaseService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          type: createDto.type,
          title: createDto.title,
          message: createDto.message,
          metadata: createDto.metadata,
        },
        include: {
          user: {
            select: { uid: true, company: { select: { uid: true } } },
          },
        },
      });
    });

    it('should create notification with null metadata if not provided', async () => {
      const createDto: CreateNotificationDto = {
        userUid: 'user-uid-123',
        type: NotificationType.APPLICATION_STATUS,
        title: 'Application Status Updated',
        message: 'Your application has been reviewed',
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.create.mockResolvedValue({
        ...mockNotification,
        metadata: null,
      });

      const result = await service.create(createDto);

      expect(databaseService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          type: createDto.type,
          title: createDto.title,
          message: createDto.message,
          metadata: null,
        },
        include: {
          user: {
            select: { uid: true, company: { select: { uid: true } } },
          },
        },
      });
      expect(result.metadata).toBeNull();
    });

    it('should emit SSE notification after creation', async () => {
      const createDto: CreateNotificationDto = {
        userUid: 'user-uid-123',
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview Scheduled',
        message: 'Your interview has been scheduled',
        metadata: { interviewUid: 'interview-uid-123' },
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.create.mockResolvedValue(mockNotification);

      await service.create(createDto);

      expect(sseService.emitNotification).toHaveBeenCalledWith(
        mockNotification.uid,
        mockNotification.type,
        mockNotification.title,
        mockNotification.message,
        mockNotification.metadata,
        mockUser.uid,
        mockUser.company.uid,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const createDto: CreateNotificationDto = {
        userUid: 'invalid-uid',
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview Scheduled',
        message: 'Your interview has been scheduled',
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { uid: 'invalid-uid' },
      });
      expect(databaseService.notification.create).not.toHaveBeenCalled();
    });

    it('should handle different notification types', async () => {
      const notificationTypes = [
        NotificationType.APPLICATION_RECEIVED,
        NotificationType.APPLICATION_STATUS,
        NotificationType.INTERVIEW_REMINDER_24H,
        NotificationType.INTERVIEW_CANCELLED,
        NotificationType.HIRING_PROCESS_STARTED,
      ];

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      for (const type of notificationTypes) {
        const createDto: CreateNotificationDto = {
          userUid: 'user-uid-123',
          type,
          title: `Test ${type}`,
          message: `Test message for ${type}`,
        };

        mockDatabaseService.notification.create.mockResolvedValue({
          ...mockNotification,
          type,
          title: createDto.title,
          message: createDto.message,
        });

        const result = await service.create(createDto);

        expect(result.type).toBe(type);
        jest.clearAllMocks();
        mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      }
    });
  });

  describe('findAll', () => {
    it('should return all notifications for a user with pagination', async () => {
      const query: GetNotificationsQueryDto = {
        limit: 20,
        skip: 0,
      };

      const mockNotifications = [
        mockNotification,
        {
          ...mockNotification,
          id: 2,
          uid: 'notif-uid-456',
          type: NotificationType.APPLICATION_STATUS,
          title: 'Application Status',
          message: 'Your application has been reviewed',
        },
      ];

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.findAll('user-uid-123', query);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('uid', 'notif-uid-123');
      expect(result[1]).toHaveProperty('uid', 'notif-uid-456');
      expect(databaseService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: {
          user: {
            select: { uid: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should filter by read status', async () => {
      const query: GetNotificationsQueryDto = {
        isRead: false,
        limit: 10,
        skip: 0,
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.findMany.mockResolvedValue([mockNotification]);

      await service.findAll('user-uid-123', query);

      expect(databaseService.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          isRead: false,
        },
        include: {
          user: {
            select: { uid: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should apply pagination correctly', async () => {
      const query: GetNotificationsQueryDto = {
        limit: 5,
        skip: 10,
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.findMany.mockResolvedValue([]);

      await service.findAll('user-uid-123', query);

      expect(databaseService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: {
          user: {
            select: { uid: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        skip: 10,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const query: GetNotificationsQueryDto = {
        limit: 20,
        skip: 0,
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.findAll('invalid-uid', query)).rejects.toThrow(NotFoundException);
      expect(databaseService.notification.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count for a user', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-uid-123');

      expect(result).toBe(5);
      expect(databaseService.notification.count).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          isRead: false,
        },
      });
    });

    it('should return 0 if no unread notifications', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount('user-uid-123');

      expect(result).toBe(0);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUnreadCount('invalid-uid')).rejects.toThrow(NotFoundException);
      expect(databaseService.notification.count).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const readNotification = {
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      };

      mockDatabaseService.notification.findUnique.mockResolvedValue(mockNotification);
      mockDatabaseService.notification.update.mockResolvedValue(readNotification);

      const result = await service.markAsRead('notif-uid-123', 'user-uid-123');

      expect(result).toHaveProperty('isRead', true);
      expect(result).toHaveProperty('readAt');
      expect(databaseService.notification.update).toHaveBeenCalledWith({
        where: { uid: 'notif-uid-123' },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
        include: {
          user: {
            select: { uid: true },
          },
        },
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockDatabaseService.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('invalid-uid', 'user-uid-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(databaseService.notification.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if notification belongs to different user', async () => {
      const otherUserNotification = {
        ...mockNotification,
        user: { uid: 'other-user-uid' },
      };

      mockDatabaseService.notification.findUnique.mockResolvedValue(otherUserNotification);

      await expect(service.markAsRead('notif-uid-123', 'user-uid-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(databaseService.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.updateMany.mockResolvedValue({ count: 10 });

      const result = await service.markAllAsRead('user-uid-123');

      expect(result).toEqual({ count: 10 });
      expect(databaseService.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });

    it('should return count 0 if no unread notifications', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead('user-uid-123');

      expect(result).toEqual({ count: 0 });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.markAllAsRead('invalid-uid')).rejects.toThrow(NotFoundException);
      expect(databaseService.notification.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a notification successfully', async () => {
      mockDatabaseService.notification.findUnique.mockResolvedValue(mockNotification);
      mockDatabaseService.notification.delete.mockResolvedValue(mockNotification);

      await service.remove('notif-uid-123', 'user-uid-123');

      expect(databaseService.notification.delete).toHaveBeenCalledWith({
        where: { uid: 'notif-uid-123' },
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockDatabaseService.notification.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-uid', 'user-uid-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(databaseService.notification.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if notification belongs to different user', async () => {
      const otherUserNotification = {
        ...mockNotification,
        user: { uid: 'other-user-uid' },
      };

      mockDatabaseService.notification.findUnique.mockResolvedValue(otherUserNotification);

      await expect(service.remove('notif-uid-123', 'user-uid-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(databaseService.notification.delete).not.toHaveBeenCalled();
    });
  });
});
