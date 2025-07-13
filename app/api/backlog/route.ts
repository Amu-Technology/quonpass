import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// バリデーションスキーマ
const createBacklogItemSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["todo", "in_progress", "review", "done"]).default("todo"),
  assignee: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  actual_hours: z.number().min(0).optional(),
  due_date: z.string().optional(), // ISO date string
  tags: z.array(z.string()).optional(),
  git_branch: z.string().optional(),
  git_commit: z.string().optional(),
});

/**
 * @swagger
 * /api/backlog:
 *   get:
 *     summary: バックログ一覧を取得するAPI
 *     description: バックログアイテムの一覧を取得します
 *     tags: [Backlog]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, review, done]
 *         description: ステータスでフィルタリング
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: 優先度でフィルタリング
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: 担当者でフィルタリング
 *     responses:
 *       200:
 *         description: バックログ一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BacklogItem'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: バックログアイテムを作成するAPI
 *     description: 新しいバックログアイテムを作成します
 *     tags: [Backlog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBacklogItemRequest'
 *     responses:
 *       201:
 *         description: バックログアイテム作成に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BacklogItem'
 *       400:
 *         description: リクエストエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignee = searchParams.get("assignee");

    const whereClause: Prisma.BacklogItemWhereInput = {};

    // ステータスでフィルタリング
    if (status) {
      whereClause.status = status as Prisma.BacklogItemWhereInput["status"];
    }

    // 優先度でフィルタリング
    if (priority) {
      whereClause.priority = priority as Prisma.BacklogItemWhereInput["priority"];
    }

    // 担当者でフィルタリング
    if (assignee) {
      whereClause.assignee = { contains: assignee, mode: "insensitive" };
    }

    const backlogItems = await prisma.backlogItem.findMany({
      where: whereClause,
      orderBy: [
        { priority: "desc" },
        { created_at: "desc" }
      ],
    });

    return NextResponse.json(backlogItems);
  } catch (error) {
    console.error("バックログ一覧の取得に失敗しました:", error);
    return NextResponse.json(
      { error: "バックログ一覧の取得に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    const validatedData = createBacklogItemSchema.parse(body);

    // バックログアイテムを作成
    const backlogItem = await prisma.backlogItem.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        assignee: validatedData.assignee,
        estimated_hours: validatedData.estimated_hours,
        actual_hours: validatedData.actual_hours,
        due_date: validatedData.due_date ? new Date(validatedData.due_date) : null,
        tags: validatedData.tags,
        git_branch: validatedData.git_branch,
        git_commit: validatedData.git_commit,
      },
    });

    return NextResponse.json(backlogItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("バリデーションエラー:", error.errors);
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("バックログアイテムの作成に失敗しました:", error);
    return NextResponse.json(
      { error: "バックログアイテムの作成に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
} 