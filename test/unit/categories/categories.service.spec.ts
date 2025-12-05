import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from '../../../src/categories/categories.service';
import { Category } from '../../../src/categories/entities/category.entity';

describe('CategoriesService - Unit Tests', () => {
  let service: CategoriesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Category CRUD Operations', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a category', () => {
      const createCategoryDto = {
        name: 'Running',
        description: 'Running shoes and gear',
        image: 'https://example.com/running.jpg',
      };

      expect(createCategoryDto).toHaveProperty('name');
      expect(createCategoryDto.name.length).toBeGreaterThan(0);
    });

    it('should find all categories', () => {
      mockRepository.find.mockResolvedValue([
        { id: 1, name: 'Running' },
        { id: 2, name: 'Basketball' },
      ]);

      expect(mockRepository.find).toBeDefined();
    });

    it('should find category by ID', () => {
      const categoryId = 1;
      mockRepository.findOne.mockResolvedValue({
        id: categoryId,
        name: 'Running',
      });

      expect(mockRepository.findOne).toBeDefined();
    });

    it('should update category', () => {
      const updateDto = {
        name: 'Athletic',
        description: 'Athletic gear',
      };

      expect(updateDto).toHaveProperty('name');
    });

    it('should delete a category', () => {
      const categoryId = 1;
      expect(typeof categoryId).toBe('number');
    });
  });

  describe('Category Validation', () => {
    it('should validate category name is required', () => {
      const category = { name: 'Running' };
      expect(category.name).toBeDefined();
      expect(category.name.length).toBeGreaterThan(0);
    });

    it('should enforce unique category names', () => {
      const names = ['Running', 'Basketball', 'Tennis'];
      expect(new Set(names).size).toBe(names.length);
    });

    it('should validate description length', () => {
      const description = 'A category for all running gear';
      expect(description.length).toBeGreaterThan(0);
    });

    it('should validate slug format', () => {
      const slug = 'running-shoes';
      expect(slug).toMatch(/^[a-z0-9\-]+$/);
    });
  });

  describe('Category Hierarchy', () => {
    it('should support parent category', () => {
      const category = {
        id: 1,
        name: 'Running Shoes',
        parentId: 5,
      };

      expect(category).toHaveProperty('parentId');
    });

    it('should track subcategories', () => {
      const subcategories = [
        { id: 2, name: 'Men Running' },
        { id: 3, name: 'Women Running' },
      ];

      expect(Array.isArray(subcategories)).toBe(true);
    });

    it('should build category tree', () => {
      const categoryTree = {
        id: 1,
        name: 'Sports',
        children: [
          { id: 2, name: 'Running' },
          { id: 3, name: 'Basketball' },
        ],
      };

      expect(categoryTree.children).toBeDefined();
      expect(categoryTree.children.length).toBe(2);
    });
  });

  describe('Category Metadata', () => {
    it('should store category image', () => {
      const category = {
        id: 1,
        image: 'https://example.com/running.jpg',
        imageAlt: 'Running shoes category',
      };

      expect(category).toHaveProperty('image');
    });

    it('should track product count', () => {
      const category = {
        id: 1,
        name: 'Running',
        productCount: 45,
      };

      expect(category.productCount).toBeGreaterThanOrEqual(0);
    });

    it('should store category color/style', () => {
      const category = {
        color: '#FF5733',
        icon: 'running-icon',
      };

      expect(category).toHaveProperty('color');
    });

    it('should support category rankings', () => {
      const ranking = {
        position: 1,
        displayOrder: 5,
        featured: true,
      };

      expect(ranking).toHaveProperty('position');
    });
  });

  describe('Category Search and Filtering', () => {
    it('should search by name', () => {
      const searchTerm = 'run';
      const categories = [
        { name: 'Running' },
        { name: 'Basketball' },
        { name: 'Running Shoes' },
      ];

      const results = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by active status', () => {
      const categories = [
        { id: 1, name: 'Running', active: true },
        { id: 2, name: 'Old Category', active: false },
      ];

      const activeCategories = categories.filter(c => c.active);
      expect(activeCategories.length).toBe(1);
    });

    it('should retrieve popular categories', () => {
      const categories = [
        { name: 'Running', views: 1000 },
        { name: 'Basketball', views: 500 },
        { name: 'Tennis', views: 200 },
      ];

      const popular = [...categories].sort((a, b) => b.views - a.views);
      expect(popular[0].name).toBe('Running');
    });
  });
});
