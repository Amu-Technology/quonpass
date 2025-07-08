import { NextResponse } from "next/server";

/**
 * OpenAPI仕様を生成するAPIルート
 */
export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "QuonPass API",
      description: "QuonPassアプリケーションのAPI仕様書",
      version: "1.0.0",
      contact: {
        name: "QuonPass Team",
        email: "support@quonpass.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-domain.com"
            : "http://localhost:3000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "認証関連のAPI",
      },
      {
        name: "Users",
        description: "ユーザー管理のAPI",
      },
      {
        name: "Stores",
        description: "店舗管理のAPI",
      },
      {
        name: "Products",
        description: "商品管理のAPI",
      },
      {
        name: "Sales",
        description: "売上管理のAPI",
      },
      {
        name: "Analytics",
        description: "分析データのAPI",
      },
      {
        name: "Upload",
        description: "CSVアップロードのAPI",
      },
      {
        name: "Items",
        description: "商品管理のAPI",
      },
      {
        name: "Orders",
        description: "発注管理のAPI",
      },
      {
        name: "Documentation",
        description: "ドキュメント関連のAPI",
      },
    ],
    paths: {
      "/api/auth/signin": {
        post: {
          tags: ["Auth"],
          summary: "サインイン",
          description: "ユーザーのサインイン処理を行います",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                    },
                    password: {
                      type: "string",
                    },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "サインイン成功",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "認証失敗",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "ユーザー一覧を取得",
          description: "全ユーザーの一覧を取得します",
          responses: {
            "200": {
              description: "ユーザー一覧の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Users"],
          summary: "ユーザーを作成",
          description: "新しいユーザーを作成します",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateUserRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "ユーザー作成に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "現在のユーザー情報を取得",
          description: "ログイン中のユーザーの情報を取得します",
          responses: {
            "200": {
              description: "ユーザー情報の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
            "401": {
              description: "認証が必要",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/all": {
        get: {
          tags: ["Users"],
          summary: "全ユーザー一覧を取得",
          description: "店舗情報を含む全ユーザーの一覧を取得します",
          responses: {
            "200": {
              description: "ユーザー一覧の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/UserWithStore",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/stores": {
        get: {
          tags: ["Stores"],
          summary: "店舗一覧を取得",
          description: "全店舗の一覧を取得します",
          responses: {
            "200": {
              description: "店舗一覧の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Store",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Stores"],
          summary: "店舗を作成",
          description: "新しい店舗を作成します",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateStoreRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "店舗作成に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Store",
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "商品一覧を取得",
          description:
            "店舗IDとカテゴリIDでフィルタリングして商品一覧を取得します",
          parameters: [
            {
              in: "query",
              name: "storeId",
              schema: {
                type: "integer",
              },
              description: "店舗ID",
            },
            {
              in: "query",
              name: "categoryId",
              schema: {
                type: "integer",
              },
              description: "カテゴリID",
            },
          ],
          responses: {
            "200": {
              description: "商品一覧の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Product",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/sales-records": {
        get: {
          tags: ["Sales"],
          summary: "売上記録を取得",
          description:
            "店舗の売上記録を日付範囲と店舗IDでフィルタリングして取得します",
          parameters: [
            {
              in: "query",
              name: "startDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "開始日（YYYY-MM-DD形式）",
            },
            {
              in: "query",
              name: "endDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "終了日（YYYY-MM-DD形式）",
            },
            {
              in: "query",
              name: "storeId",
              schema: {
                type: "integer",
              },
              description: "店舗ID",
            },
          ],
          responses: {
            "200": {
              description: "売上記録の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/SalesRecord",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/register-closes": {
        get: {
          tags: ["Sales"],
          summary: "レジクローズ記録を取得",
          description:
            "レジクローズ記録を日付範囲と店舗IDでフィルタリングして取得します",
          parameters: [
            {
              in: "query",
              name: "startDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "開始日（YYYY-MM-DD形式）",
            },
            {
              in: "query",
              name: "endDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "終了日（YYYY-MM-DD形式）",
            },
            {
              in: "query",
              name: "storeId",
              schema: {
                type: "integer",
              },
              description: "店舗ID",
            },
          ],
          responses: {
            "200": {
              description: "レジクローズ記録の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RegisterClose",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/analytics": {
        get: {
          tags: ["Analytics"],
          summary: "売上分析を取得",
          description:
            "期間、店舗ID、日付範囲でフィルタリングして売上分析を取得します",
          parameters: [
            {
              in: "query",
              name: "period",
              schema: {
                type: "string",
                enum: ["day", "week", "month", "year"],
              },
              description: "期間（month, week, day, year）",
            },
            {
              in: "query",
              name: "storeId",
              schema: {
                type: "integer",
              },
              description: "店舗ID",
            },
            {
              in: "query",
              name: "currentDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "基準日",
            },
            {
              in: "query",
              name: "startDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "開始日",
            },
            {
              in: "query",
              name: "endDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "終了日",
            },
          ],
          responses: {
            "200": {
              description: "売上分析の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Analytics",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/upload-products-csv": {
        post: {
          tags: ["Upload"],
          summary: "商品CSVをアップロード",
          description:
            "商品CSVファイルをアップロードして商品データをインポートします",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "商品CSVファイル",
                    },
                    storeId: {
                      type: "string",
                      description: "店舗ID",
                    },
                  },
                  required: ["file", "storeId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "CSVアップロードに成功",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                      },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            row: {
                              type: "object",
                            },
                            message: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/upload-sales-csv": {
        post: {
          tags: ["Upload"],
          summary: "売上CSVをアップロード",
          description:
            "売上CSVファイルをアップロードして売上データをインポートします",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "売上CSVファイル",
                    },
                    storeId: {
                      type: "string",
                      description: "店舗ID",
                    },
                  },
                  required: ["file", "storeId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "CSVアップロードに成功",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                      },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            row: {
                              type: "object",
                            },
                            message: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/upload-register-close-csv": {
        post: {
          tags: ["Upload"],
          summary: "レジクローズCSVをアップロード",
          description:
            "レジクローズCSVファイルをアップロードしてレジクローズデータをインポートします",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "レジクローズCSVファイル",
                    },
                    storeId: {
                      type: "string",
                      description: "店舗ID",
                    },
                  },
                  required: ["file", "storeId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "CSVアップロードに成功",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                      },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            row: {
                              type: "object",
                            },
                            message: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/orders": {
        get: {
          tags: ["Orders"],
          summary: "発注一覧を取得",
          description: "全発注の一覧を取得します",
          parameters: [
            {
              in: "query",
              name: "storeId",
              schema: {
                type: "integer",
              },
              description: "店舗IDでフィルタリング",
            },
            {
              in: "query",
              name: "status",
              schema: {
                type: "string",
                enum: ["active", "inactive", "archived"],
              },
              description: "ステータスでフィルタリング",
            },
            {
              in: "query",
              name: "startDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "開始日（YYYY-MM-DD形式）",
            },
            {
              in: "query",
              name: "endDate",
              schema: {
                type: "string",
                format: "date",
              },
              description: "終了日（YYYY-MM-DD形式）",
            },
          ],
          responses: {
            "200": {
              description: "発注一覧の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Order",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Orders"],
          summary: "発注を作成",
          description: "新しい発注を作成します（複数の商品を含む）",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateOrderRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "発注作成に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Order",
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "発注詳細を取得",
          description: "指定されたIDの発注詳細を取得します",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "発注ID",
            },
          ],
          responses: {
            "200": {
              description: "発注詳細の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Order",
                  },
                },
              },
            },
            "404": {
              description: "発注が見つかりません",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["Orders"],
          summary: "発注を更新",
          description: "指定されたIDの発注を更新します",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "発注ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateOrderRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "発注更新に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Order",
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "404": {
              description: "発注が見つかりません",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Orders"],
          summary: "発注を削除",
          description: "指定されたIDの発注を削除します",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "発注ID",
            },
          ],
          responses: {
            "200": {
              description: "発注削除に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "発注が見つかりません",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/items": {
        get: {
          tags: ["Items"],
          summary: "商品一覧を取得",
          description: "全商品の一覧を取得します",
          parameters: [
            {
              in: "query",
              name: "type",
              schema: {
                type: "string",
                enum: ["食材", "商品", "資材", "特殊"],
              },
              description: "商品タイプでフィルタリング",
            },
            {
              in: "query",
              name: "search",
              schema: {
                type: "string",
              },
              description: "商品名で検索",
            },
          ],
          responses: {
            "200": {
              description: "商品一覧の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Item",
                    },
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Items"],
          summary: "商品を作成",
          description: "新しい商品を作成します",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateItemRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "商品作成に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Item",
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/items/{id}": {
        get: {
          tags: ["Items"],
          summary: "商品詳細を取得",
          description: "指定されたIDの商品詳細を取得します",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "商品ID",
            },
          ],
          responses: {
            "200": {
              description: "商品詳細の取得に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Item",
                  },
                },
              },
            },
            "404": {
              description: "商品が見つかりません",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["Items"],
          summary: "商品を更新",
          description: "指定されたIDの商品を更新します",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "商品ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateItemRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "商品更新に成功",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Item",
                  },
                },
              },
            },
            "400": {
              description: "リクエストエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "404": {
              description: "商品が見つかりません",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Items"],
          summary: "商品を削除",
          description: "指定されたIDの商品を削除します",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "商品ID",
            },
          ],
          responses: {
            "200": {
              description: "商品削除に成功",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "商品が見つかりません",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/erd": {
        get: {
          tags: ["Documentation"],
          summary: "ER図を取得",
          description: "PrismaスキーマからER図を生成してSVG形式で返します",
          responses: {
            "200": {
              description: "ER図の取得に成功",
              content: {
                "image/svg+xml": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
            "500": {
              description: "サーバーエラー",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
              nullable: true,
            },
            email: {
              type: "string",
            },
            role: {
              type: "string",
              nullable: true,
            },
            store_id: {
              type: "integer",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
        UserWithStore: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
              nullable: true,
            },
            email: {
              type: "string",
            },
            role: {
              type: "string",
              nullable: true,
            },
            store_id: {
              type: "integer",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            stores: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
              nullable: true,
            },
          },
        },
        CreateUserRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            role: {
              type: "string",
            },
            store_id: {
              type: "integer",
            },
          },
          required: ["name", "email", "role", "store_id"],
        },
        Store: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            name: {
              type: "string",
            },
            address: {
              type: "string",
              nullable: true,
            },
            phone: {
              type: "string",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CreateStoreRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            address: {
              type: "string",
            },
            phone: {
              type: "string",
            },
          },
          required: ["name"],
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            name: {
              type: "string",
            },
            description: {
              type: "string",
              nullable: true,
            },
            price: {
              type: "number",
            },
            status: {
              type: "string",
            },
            category: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
            stores: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
          },
        },
        SalesRecord: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            date: {
              type: "string",
              format: "date",
            },
            quantity: {
              type: "integer",
            },
            unit_price: {
              type: "number",
            },
            sales_amount: {
              type: "number",
            },
            store: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
            product: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
          },
        },
        RegisterClose: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            date: {
              type: "string",
              format: "date",
            },
            customer_count: {
              type: "integer",
            },
            total_sales: {
              type: "number",
            },
            net_sales: {
              type: "number",
            },
            cash_amount: {
              type: "number",
            },
            credit_amount: {
              type: "number",
            },
            point_amount: {
              type: "number",
            },
            electronic_money_amount: {
              type: "number",
            },
            store: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
          },
        },
        Analytics: {
          type: "object",
          properties: {
            totalCustomers: {
              type: "integer",
            },
            averageCustomerValue: {
              type: "number",
            },
            totalSales: {
              type: "number",
            },
            purchaseRate: {
              type: "number",
            },
            productComposition: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  sales: {
                    type: "number",
                  },
                  percentage: {
                    type: "number",
                  },
                },
              },
            },
            dailySales: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: {
                    type: "string",
                  },
                  sales: {
                    type: "number",
                  },
                },
              },
            },
            categorySales: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  sales: {
                    type: "number",
                  },
                  percentage: {
                    type: "number",
                  },
                },
              },
            },
          },
        },
        Item: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            type: {
              type: "string",
              enum: ["食材", "商品", "資材", "特殊"],
            },
            name: {
              type: "string",
            },
            unit: {
              type: "string",
              enum: [
                "g",
                "kg",
                "袋",
                "本",
                "枚",
                "巻",
                "個",
                "冊",
                "式",
                "束",
                "台",
                "箱",
                "粒",
                "ケース",
                "セット",
                "バルク",
                "ロット",
              ],
            },
            minimum_order_quantity: {
              type: "string",
            },
            price: {
              type: "number",
            },
          },
        },
        CreateItemRequest: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["食材", "商品", "資材", "特殊"],
            },
            name: {
              type: "string",
            },
            unit: {
              type: "string",
              enum: [
                "g",
                "kg",
                "袋",
                "本",
                "枚",
                "巻",
                "個",
                "冊",
                "式",
                "束",
                "台",
                "箱",
                "粒",
                "ケース",
                "セット",
                "バルク",
                "ロット",
              ],
            },
            minimum_order_quantity: {
              type: "string",
            },
            price: {
              type: "number",
            },
          },
          required: ["type", "name", "unit", "minimum_order_quantity", "price"],
        },
        UpdateItemRequest: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["食材", "商品", "資材", "特殊"],
            },
            name: {
              type: "string",
            },
            unit: {
              type: "string",
              enum: [
                "g",
                "kg",
                "袋",
                "本",
                "枚",
                "巻",
                "個",
                "冊",
                "式",
                "束",
                "台",
                "箱",
                "粒",
                "ケース",
                "セット",
                "バルク",
                "ロット",
              ],
            },
            minimum_order_quantity: {
              type: "string",
            },
            price: {
              type: "number",
            },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            store_id: {
              type: "integer",
            },
            user_id: {
              type: "string",
              nullable: true,
            },
            other_delivery_address: {
              type: "string",
              nullable: true,
            },
            holiday: {
              type: "string",
              enum: ["月", "火", "水", "木", "金", "土", "日"],
              nullable: true,
            },
            request_message: {
              type: "string",
              nullable: true,
            },
            total_amount: {
              type: "number",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "archived"],
            },
            order_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            updated_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            stores: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
            users: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  nullable: true,
                },
                email: {
                  type: "string",
                },
              },
              nullable: true,
            },
            orderItem: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                  },
                  order_id: {
                    type: "integer",
                  },
                  item_id: {
                    type: "integer",
                  },
                  quantity: {
                    type: "integer",
                  },
                  unit_price: {
                    type: "number",
                  },
                  created_at: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  updated_at: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  item: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      unit: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        CreateOrderRequest: {
          type: "object",
          properties: {
            store_id: {
              type: "integer",
            },
            user_id: {
              type: "string",
            },
            other_delivery_address: {
              type: "string",
            },
            holiday: {
              type: "string",
              enum: ["月", "火", "水", "木", "金", "土", "日"],
            },
            request_message: {
              type: "string",
            },
            total_amount: {
              type: "number",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "archived"],
            },
            order_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item_id: {
                    type: "integer",
                  },
                  quantity: {
                    type: "integer",
                  },
                  unit_price: {
                    type: "number",
                  },
                },
                required: ["item_id", "quantity", "unit_price"],
              },
            },
          },
          required: ["store_id", "total_amount", "status", "order_items"],
        },
        UpdateOrderRequest: {
          type: "object",
          properties: {
            store_id: {
              type: "integer",
            },
            user_id: {
              type: "string",
            },
            other_delivery_address: {
              type: "string",
            },
            holiday: {
              type: "string",
              enum: ["月", "火", "水", "木", "金", "土", "日"],
            },
            request_message: {
              type: "string",
            },
            total_amount: {
              type: "number",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "archived"],
            },
            order_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item_id: {
                    type: "integer",
                  },
                  quantity: {
                    type: "integer",
                  },
                  unit_price: {
                    type: "number",
                  },
                },
                required: ["item_id", "quantity", "unit_price"],
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
            },
            details: {
              type: "string",
              nullable: true,
            },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
