import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, GetNotificationsQueryDto } from './dto';
import { AuthGuard } from '../shared/modules/auth/guards/auth.guard';
import { NotificationType, RolesType } from '@prisma/client';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: NotificationsService;

  const mockUser = {
    id: 1,
    uid: 'user-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    roles: [RolesType.HR],
    companyId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastLogin: null,
  };

  const mockNotificationResponse = {
    uid: 'notif-uid-123',
    userUid: 'user-uid-123',
    type: NotificationType.INTERVIEW_SCHEDULED,
    title: 'Interview Scheduled',
    message: 'Your interview has been scheduled for tomorrow',
    isRead: false,
    metadata: { interviewUid: 'interview-uid-123' },
    createdAt: new Date(),
    readAt: null,
  };

  const mockNotificationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockNotificationsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createDto: CreateNotificationDto = {
        userUid: 'user-uid-123',
        type: NotificationType.INTERVIEW_SCHEDULED,
        title: 'Interview Scheduled',
        message: 'Your interview has been scheduled for tomorrow',
        metadata: { interviewUid: 'interview-uid-123' },
      };

      mockNotificationsService.create.mockResolvedValue(mockNotificationResponse);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockNotificationResponse);
      expect(notificationsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should create notification with different types', async () => {
      const types = [NotificationType.APPLICATION_STATUS, NotificationType.INTERVIEW_REMINDER_24H, NotificationType.HIRING_PROCESS_STARTED];

      for (const type of types) {
        const createDto: CreateNotificationDto = {
          userUid: 'user-uid-123',
          type,
          title: `Test ${type}`,
          message: `Test message for ${type}`,
        };

        const response = {
          ...mockNotificationResponse,
          type,
          title: createDto.title,
          message: createDto.message,
        };

        mockNotificationsService.create.mockResolvedValue(response);

        const result = await controller.create(createDto);

        expect(result.type).toBe(type);
        expect(notificationsService.create).toHaveBeenCalledWith(createDto);
        jest.clearAllMocks();
      }
    });

    it('should create notification without metadata', async () => {
      const createDto: CreateNotificationDto = {
        userUid: 'user-uid-123',
        type: NotificationType.APPLICATION_RECEIVED,
        title: 'Application Received',
        message: 'Your application has been received',
      };

      const response = {
        ...mockNotificationResponse,
        metadata: null,
      };

      mockNotificationsService.create.mockResolvedValue(response);

      const result = await controller.create(createDto);

      expect(result.metadata).toBeNull();
      expect(notificationsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all notifications for current user', async () => {
      const query: GetNotificationsQueryDto = {
        limit: 20,
        skip: 0,
      };

      const mockNotifications = [
        mockNotificationResponse,
        {
          ...mockNotificationResponse,
          uid: 'notif-uid-456',
          type: NotificationType.APPLICATION_STATUS,
        },
      ];

      mockNotificationsService.findAll.mockResolvedValue(mockNotifications);

      const result = await controller.findAll(mockUser, query);

      expect(result).toEqual(mockNotifications);
      expect(result).toHaveLength(2);
      expect(notificationsService.findAll).toHaveBeenCalledWith('user-uid-123', query);
    });

    it('should apply pagination parameters', async () => {
      const query: GetNotificationsQueryDto = {
        limit: 10,
        skip: 5,
      };

      mockNotificationsService.findAll.mockResolvedValue([]);

      await controller.findAll(mockUser, query);

      expect(notificationsService.findAll).toHaveBeenCalledWith('user-uid-123', query);
    });

    it('should filter by read status', async () => {
      const query: GetNotificationsQueryDto = {
        isRead: false,
        limit: 20,
        skip: 0,
      };

      mockNotificationsService.findAll.mockResolvedValue([mockNotificationResponse]);

      const result = await controller.findAll(mockUser, query);

      expect(result).toHaveLength(1);
      expect(notificationsService.findAll).toHaveBeenCalledWith('user-uid-123', query);
    });

    it('should return empty array if no notifications', async () => {
      const query: GetNotificationsQueryDto = {
        limit: 20,
        skip: 0,
      };

      mockNotificationsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, query);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual({ count: 5 });
      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith('user-uid-123');
    });

    it('should return 0 if no unread notifications', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual({ count: 0 });
    });

    it('should use current user UID from auth decorator', async () => {
      const differentUser = {
        ...mockUser,
        uid: 'different-user-uid',
      };

      mockNotificationsService.getUnreadCount.mockResolvedValue(3);

      await controller.getUnreadCount(differentUser);

      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith('different-user-uid');
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const readNotification = {
        ...mockNotificationResponse,
        isRead: true,
        readAt: new Date(),
      };

      mockNotificationsService.markAsRead.mockResolvedValue(readNotification);

      const result = await controller.markAsRead('notif-uid-123', mockUser);

      expect(result).toEqual(readNotification);
      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
      expect(notificationsService.markAsRead).toHaveBeenCalledWith('notif-uid-123', 'user-uid-123');
    });

    it('should use current user UID for authorization', async () => {
      const differentUser = {
        ...mockUser,
        uid: 'different-user-uid',
      };

      mockNotificationsService.markAsRead.mockResolvedValue({
        ...mockNotificationResponse,
        isRead: true,
      });

      await controller.markAsRead('notif-uid-123', differentUser);

      expect(notificationsService.markAsRead).toHaveBeenCalledWith('notif-uid-123', 'different-user-uid');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 10 });

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual({ count: 10 });
      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('user-uid-123');
    });

    it('should return count 0 if no unread notifications', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 0 });

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual({ count: 0 });
    });

    it('should use current user UID from auth decorator', async () => {
      const differentUser = {
        ...mockUser,
        uid: 'different-user-uid',
      };

      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 5 });

      await controller.markAllAsRead(differentUser);

      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('different-user-uid');
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      mockNotificationsService.remove.mockResolvedValue(undefined);

      await controller.remove('notif-uid-123', mockUser);

      expect(notificationsService.remove).toHaveBeenCalledWith('notif-uid-123', 'user-uid-123');
    });

    it('should use current user UID for authorization', async () => {
      const differentUser = {
        ...mockUser,
        uid: 'different-user-uid',
      };

      mockNotificationsService.remove.mockResolvedValue(undefined);

      await controller.remove('notif-uid-123', differentUser);

      expect(notificationsService.remove).toHaveBeenCalledWith('notif-uid-123', 'different-user-uid');
    });

    it('should return void on successful deletion', async () => {
      mockNotificationsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('notif-uid-123', mockUser);

      expect(result).toBeUndefined();
    });
  });

  describe('authorization', () => {
    it('should require authentication for all endpoints', () => {
      const guards = Reflect.getMetadata('__guards__', NotificationsController);
      expect(guards).toBeDefined();
      expect(guards).toContain(AuthGuard);
    });

    it('should ensure user can only access their own notifications', async () => {
      const user1 = { ...mockUser, uid: 'user-1-uid' };
      const user2 = { ...mockUser, uid: 'user-2-uid' };

      mockNotificationsService.findAll.mockResolvedValue([mockNotificationResponse]);

      // User 1 accesses their notifications
      await controller.findAll(user1, { limit: 20, skip: 0 });
      expect(notificationsService.findAll).toHaveBeenCalledWith('user-1-uid', expect.any(Object));

      jest.clearAllMocks();

      // User 2 accesses their notifications
      await controller.findAll(user2, { limit: 20, skip: 0 });
      expect(notificationsService.findAll).toHaveBeenCalledWith('user-2-uid', expect.any(Object));
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Database connection failed');
      mockNotificationsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(mockUser, { limit: 20, skip: 0 })).rejects.toThrow(error);
    });

    it('should handle invalid UIDs gracefully', async () => {
      const error = new Error('Invalid UID format');
      mockNotificationsService.markAsRead.mockRejectedValue(error);

      await expect(controller.markAsRead('invalid-uid', mockUser)).rejects.toThrow(error);
    });
  });
});
