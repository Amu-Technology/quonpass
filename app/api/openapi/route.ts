import { NextResponse } from 'next/server';

/**
 * OpenAPI仕様を生成するAPIルート
 */
export async function GET() {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'QuonPass API',
      description: 'QuonPassアプリケーションのAPI仕様書',
      version: '1.0.0',
      contact: {
        name: 'QuonPass Team',
        email: 'support@quonpass.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: '認証関連のAPI'
      },
      {
        name: 'Users',
        description: 'ユーザー管理のAPI'
      },
      {
        name: 'Stores',
        description: '店舗管理のAPI'
      },
      {
        name: 'Products',
        description: '商品管理のAPI'
      },
      {
        name: 'Sales',
        description: '売上管理のAPI'
      },
      {
        name: 'Analytics',
        description: '分析データのAPI'
      },
      {
        name: 'Upload',
        description: 'CSVアップロードのAPI'
      }
    ],
    paths: {
      '/api/auth/signin': {
        post: {
          tags: ['Auth'],
          summary: 'サインイン',
          description: 'ユーザーのサインイン処理を行います',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email'
                    },
                    password: {
                      type: 'string'
                    }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'サインイン成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: '認証失敗',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'ユーザー一覧を取得',
          description: '全ユーザーの一覧を取得します',
          responses: {
            '200': {
              description: 'ユーザー一覧の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Users'],
          summary: 'ユーザーを作成',
          description: '新しいユーザーを作成します',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateUserRequest'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'ユーザー作成に成功',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '400': {
              description: 'リクエストエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: '現在のユーザー情報を取得',
          description: 'ログイン中のユーザーの情報を取得します',
          responses: {
            '200': {
              description: 'ユーザー情報の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '401': {
              description: '認証が必要',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/users/all': {
        get: {
          tags: ['Users'],
          summary: '全ユーザー一覧を取得',
          description: '店舗情報を含む全ユーザーの一覧を取得します',
          responses: {
            '200': {
              description: 'ユーザー一覧の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/UserWithStore'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/stores': {
        get: {
          tags: ['Stores'],
          summary: '店舗一覧を取得',
          description: '全店舗の一覧を取得します',
          responses: {
            '200': {
              description: '店舗一覧の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Store'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Stores'],
          summary: '店舗を作成',
          description: '新しい店舗を作成します',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateStoreRequest'
                }
              }
            }
          },
          responses: {
            '201': {
              description: '店舗作成に成功',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Store'
                  }
                }
              }
            },
            '400': {
              description: 'リクエストエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: '商品一覧を取得',
          description: '店舗IDとカテゴリIDでフィルタリングして商品一覧を取得します',
          parameters: [
            {
              in: 'query',
              name: 'storeId',
              schema: {
                type: 'integer'
              },
              description: '店舗ID'
            },
            {
              in: 'query',
              name: 'categoryId',
              schema: {
                type: 'integer'
              },
              description: 'カテゴリID'
            }
          ],
          responses: {
            '200': {
              description: '商品一覧の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Product'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/sales-records': {
        get: {
          tags: ['Sales'],
          summary: '売上記録を取得',
          description: '店舗の売上記録を日付範囲と店舗IDでフィルタリングして取得します',
          parameters: [
            {
              in: 'query',
              name: 'startDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '開始日（YYYY-MM-DD形式）'
            },
            {
              in: 'query',
              name: 'endDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '終了日（YYYY-MM-DD形式）'
            },
            {
              in: 'query',
              name: 'storeId',
              schema: {
                type: 'integer'
              },
              description: '店舗ID'
            }
          ],
          responses: {
            '200': {
              description: '売上記録の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SalesRecord'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/register-closes': {
        get: {
          tags: ['Sales'],
          summary: 'レジクローズ記録を取得',
          description: 'レジクローズ記録を日付範囲と店舗IDでフィルタリングして取得します',
          parameters: [
            {
              in: 'query',
              name: 'startDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '開始日（YYYY-MM-DD形式）'
            },
            {
              in: 'query',
              name: 'endDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '終了日（YYYY-MM-DD形式）'
            },
            {
              in: 'query',
              name: 'storeId',
              schema: {
                type: 'integer'
              },
              description: '店舗ID'
            }
          ],
          responses: {
            '200': {
              description: 'レジクローズ記録の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/RegisterClose'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/analytics': {
        get: {
          tags: ['Analytics'],
          summary: '売上分析を取得',
          description: '期間、店舗ID、日付範囲でフィルタリングして売上分析を取得します',
          parameters: [
            {
              in: 'query',
              name: 'period',
              schema: {
                type: 'string',
                enum: ['day', 'week', 'month', 'year']
              },
              description: '期間（month, week, day, year）'
            },
            {
              in: 'query',
              name: 'storeId',
              schema: {
                type: 'integer'
              },
              description: '店舗ID'
            },
            {
              in: 'query',
              name: 'currentDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '基準日'
            },
            {
              in: 'query',
              name: 'startDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '開始日'
            },
            {
              in: 'query',
              name: 'endDate',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: '終了日'
            }
          ],
          responses: {
            '200': {
              description: '売上分析の取得に成功',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Analytics'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/upload-products-csv': {
        post: {
          tags: ['Upload'],
          summary: '商品CSVをアップロード',
          description: '商品CSVファイルをアップロードして商品データをインポートします',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: '商品CSVファイル'
                    },
                    storeId: {
                      type: 'string',
                      description: '店舗ID'
                    }
                  },
                  required: ['file', 'storeId']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'CSVアップロードに成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            row: {
                              type: 'object'
                            },
                            message: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'リクエストエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/upload-sales-csv': {
        post: {
          tags: ['Upload'],
          summary: '売上CSVをアップロード',
          description: '売上CSVファイルをアップロードして売上データをインポートします',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: '売上CSVファイル'
                    },
                    storeId: {
                      type: 'string',
                      description: '店舗ID'
                    }
                  },
                  required: ['file', 'storeId']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'CSVアップロードに成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            row: {
                              type: 'object'
                            },
                            message: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'リクエストエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/upload-register-close-csv': {
        post: {
          tags: ['Upload'],
          summary: 'レジクローズCSVをアップロード',
          description: 'レジクローズCSVファイルをアップロードしてレジクローズデータをインポートします',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'レジクローズCSVファイル'
                    },
                    storeId: {
                      type: 'string',
                      description: '店舗ID'
                    }
                  },
                  required: ['file', 'storeId']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'CSVアップロードに成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            row: {
                              type: 'object'
                            },
                            message: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'リクエストエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            name: {
              type: 'string',
              nullable: true
            },
            email: {
              type: 'string'
            },
            role: {
              type: 'string',
              nullable: true
            },
            store_id: {
              type: 'integer',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            }
          }
        },
        UserWithStore: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            name: {
              type: 'string',
              nullable: true
            },
            email: {
              type: 'string'
            },
            role: {
              type: 'string',
              nullable: true
            },
            store_id: {
              type: 'integer',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            stores: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              },
              nullable: true
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            role: {
              type: 'string'
            },
            store_id: {
              type: 'integer'
            }
          },
          required: ['name', 'email', 'role', 'store_id']
        },
        Store: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            address: {
              type: 'string',
              nullable: true
            },
            phone: {
              type: 'string',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CreateStoreRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            address: {
              type: 'string'
            },
            phone: {
              type: 'string'
            }
          },
          required: ['name']
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string',
              nullable: true
            },
            price: {
              type: 'number'
            },
            status: {
              type: 'string'
            },
            category: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              }
            },
            stores: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              }
            }
          }
        },
        SalesRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            date: {
              type: 'string',
              format: 'date'
            },
            quantity: {
              type: 'integer'
            },
            unit_price: {
              type: 'number'
            },
            sales_amount: {
              type: 'number'
            },
            store: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              }
            },
            product: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              }
            }
          }
        },
        RegisterClose: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            date: {
              type: 'string',
              format: 'date'
            },
            customer_count: {
              type: 'integer'
            },
            total_sales: {
              type: 'number'
            },
            net_sales: {
              type: 'number'
            },
            cash_amount: {
              type: 'number'
            },
            credit_amount: {
              type: 'number'
            },
            point_amount: {
              type: 'number'
            },
            electronic_money_amount: {
              type: 'number'
            },
            store: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              }
            }
          }
        },
        Analytics: {
          type: 'object',
          properties: {
            totalCustomers: {
              type: 'integer'
            },
            averageCustomerValue: {
              type: 'number'
            },
            totalSales: {
              type: 'number'
            },
            purchaseRate: {
              type: 'number'
            },
            productComposition: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  sales: {
                    type: 'number'
                  },
                  percentage: {
                    type: 'number'
                  }
                }
              }
            },
            dailySales: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string'
                  },
                  sales: {
                    type: 'number'
                  }
                }
              }
            },
            categorySales: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  sales: {
                    type: 'number'
                  },
                  percentage: {
                    type: 'number'
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string'
            },
            details: {
              type: 'string',
              nullable: true
            }
          }
        }
      }
    }
  };

  return NextResponse.json(openApiSpec);
} 