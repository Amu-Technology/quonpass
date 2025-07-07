import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuonPass API',
      version: '1.0.0',
      description: 'QuonPassのAPI仕様書',
      contact: {
        name: 'API Support',
        email: 'support@quonpass.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '開発環境'
      }
    ],
    tags: [
      {
        name: 'Analytics',
        description: '売上分析関連のAPI'
      },
      {
        name: 'Users',
        description: 'ユーザー管理関連のAPI'
      },
      {
        name: 'Sales',
        description: '売上記録関連のAPI'
      },
      {
        name: 'Products',
        description: '商品管理関連のAPI'
      },
      {
        name: 'Upload',
        description: 'CSVアップロード関連のAPI'
      },
      {
        name: 'Stores',
        description: '店舗管理関連のAPI'
      },
      {
        name: 'Categories',
        description: 'カテゴリ管理関連のAPI'
      },
      {
        name: 'RegisterCloses',
        description: 'レジクローズ関連のAPI'
      }
    ],
    components: {
      schemas: {
        SalesRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '売上記録ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: '売上日'
            },
            quantity: {
              type: 'integer',
              description: '数量'
            },
            unit_price: {
              type: 'number',
              description: '単価'
            },
            sales_amount: {
              type: 'number',
              description: '売上金額'
            },
            store_id: {
              type: 'integer',
              description: '店舗ID'
            },
            product_id: {
              type: 'integer',
              description: '商品ID'
            },
            store: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '店舗名'
                }
              }
            },
            product: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '商品名'
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ユーザーID'
            },
            name: {
              type: 'string',
              description: 'ユーザー名'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'メールアドレス'
            },
            role: {
              type: 'string',
              enum: ['admin', 'store_manager', 'store_staff'],
              description: 'ユーザー権限'
            },
            store_id: {
              type: 'integer',
              description: '店舗ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '作成日時'
            },
            stores: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '店舗名'
                }
              }
            }
          }
        },
        Store: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '店舗ID'
            },
            name: {
              type: 'string',
              description: '店舗名'
            },
            address: {
              type: 'string',
              description: '住所'
            },
            phone: {
              type: 'string',
              description: '電話番号'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'メールアドレス'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'ステータス'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '商品ID'
            },
            name: {
              type: 'string',
              description: '商品名'
            },
            description: {
              type: 'string',
              description: '商品説明'
            },
            price: {
              type: 'number',
              description: '価格'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'ステータス'
            },
            category: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'カテゴリ名'
                }
              }
            },
            stores: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '店舗名'
                }
              }
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'カテゴリID'
            },
            code: {
              type: 'string',
              description: 'カテゴリコード'
            },
            name: {
              type: 'string',
              description: 'カテゴリ名'
            },
            level: {
              type: 'integer',
              description: 'カテゴリレベル'
            },
            parent_id: {
              type: 'integer',
              description: '親カテゴリID'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'ステータス'
            }
          }
        },
        RegisterClose: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'レジクローズID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: '日付'
            },
            store_id: {
              type: 'integer',
              description: '店舗ID'
            },
            customer_count: {
              type: 'integer',
              description: '顧客数'
            },
            total_sales: {
              type: 'number',
              description: '総売上'
            },
            store: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '店舗名'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'エラーメッセージ'
            }
          }
        }
      }
    }
  },
  apis: ['./app/api/**/*.ts', './app/api/**/*.js'], // APIルートファイルのパス
};

const specs = swaggerJsdoc(options);

export default specs; 