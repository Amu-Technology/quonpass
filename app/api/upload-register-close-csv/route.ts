import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const storeId = formData.get("storeId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "店舗IDが必要です。" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const records: Record<string, string>[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // 店舗の存在確認
    const store = await prisma.stores.findUnique({
      where: { id: parseInt(storeId) },
    });

    if (!store) {
      return NextResponse.json(
        { error: "指定された店舗が見つかりません。" },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors: { row: unknown; message: string }[] = [];

    for (const record of records) {
      try {
        // 日付の処理（2025/06/01(日)形式からDate型に変換）
        const dateStr = record["営業日"];
        if (!dateStr) {
          throw new Error("営業日が指定されていません");
        }

        // 日付文字列から日付部分を抽出（例：2025/06/01(日) → 2025/06/01）
        const dateMatch = dateStr.match(/^(\d{4}\/\d{2}\/\d{2})/);
        if (!dateMatch) {
          throw new Error(`無効な日付形式です: ${dateStr}`);
        }
        const date = new Date(dateMatch[1]);

        // 数値の処理（カンマと円マークを除去）
        const parseAmount = (value: string): number => {
          if (!value || value.trim() === '') return 0;
          const cleaned = value.replace(/[¥,]/g, '');
          return parseFloat(cleaned) || 0;
        };

        const parseCount = (value: string): number => {
          if (!value || value.trim() === '') return 0;
          return parseInt(value) || 0;
        };

        const registerCloseData = {
          date,
          store_id: store.id,
          groups_count: parseCount(record["組数(組)"]),
          customer_count: parseCount(record["客数"]),
          male_count: parseCount(record["男性"]),
          female_count: parseCount(record["女性"]),
          unspecified_count: parseCount(record["選択なし"]),
          customer_unit_price: parseAmount(record["客単価"]),
          total_items_sold: parseCount(record["総売上点数(点)"]),
          total_sales: parseAmount(record["売上"]),
          consumption_tax: parseAmount(record["消費税"]),
          sales_10_percent: parseAmount(record["売上(10%)"]),
          tax_10_percent: parseAmount(record["消費税(10%)"]),
          sales_8_percent: parseAmount(record["売上(8%)"]),
          tax_8_percent: parseAmount(record["消費税(8%)"]),
          sales_tax_free: parseAmount(record["売上(非課税)"]),
          sales_non_taxable: parseAmount(record["売上(不課税)"]),
          net_sales: parseAmount(record["純売上"]),
          duty_free_items_general: parseCount(record["免税商品点数（一般品）"]),
          duty_free_items_consumables: parseCount(record["免税商品点数（消耗品）"]),
          duty_free_amount_general: parseAmount(record["免税額（一般品）"]),
          duty_free_amount_consumables: parseAmount(record["免税額（消耗品）"]),
          service_charge_count: parseCount(record["サービス料件数"]),
          service_charge: parseAmount(record["サービス料"]),
          late_night_count: parseCount(record["深夜料件数"]),
          late_night_charge: parseAmount(record["深夜料"]),
          discount_count: parseCount(record["値割引件数"]),
          discount_amount: parseAmount(record["値割引"]),
          fraction_discount_count: parseCount(record["端数値引件数"]),
          fraction_discount_amount: parseAmount(record["端数値引額"]),
          excluded_count: parseCount(record["売上除外件数"]),
          excluded_amount: parseAmount(record["売上除外金額"]),
          cash_count: parseCount(record["現金件数"]),
          cash_amount: parseAmount(record["現金"]),
          credit_count: parseCount(record["クレジット件数"]),
          credit_amount: parseAmount(record["クレジット"]),
          point_count: parseCount(record["ポイント件数"]),
          point_amount: parseAmount(record["ポイント"]),
          electronic_money_count: parseCount(record["電子マネー件数"]),
          electronic_money_amount: parseAmount(record["電子マネー"]),
          gift_card_no_change_count: parseCount(record["商品券(釣無し)件数"]),
          gift_card_no_change_amount: parseAmount(record["商品券(釣無し)"]),
          gift_card_difference: parseAmount(record["商品券 差額"]),
          gift_card_with_change_count: parseCount(record["商品券(釣有り)件数"]),
          gift_card_with_change_amount: parseAmount(record["商品券(釣有り)"]),
          gift_card_cash_change: parseAmount(record["商品券 現金釣銭"]),
          credit_sale_count: parseCount(record["掛売件数"]),
          credit_sale_amount: parseAmount(record["掛売"]),
          cash_on_hand: parseAmount(record["お預かり現金"]),
          change_amount: parseAmount(record["お釣り"]),
          receipt_count: parseCount(record["領収書"]),
          cancel_count: parseCount(record["取消(赤伝票)件数"]),
          cancel_amount: parseAmount(record["取消(赤伝票)"]),
          correction_count: parseCount(record["訂正(黒伝票)件数"]),
          correction_amount: parseAmount(record["訂正(黒伝票)"]),
          uncollected_count: parseCount(record["未回収件数"]),
          uncollected_amount: parseAmount(record["未回収金額"]),
          cash_balance: parseAmount(record["現金在高"]),
          cash_at_open: parseAmount(record["レジオープン時現金"]),
          deposit_count: parseCount(record["入金件数"]),
          deposit_amount: parseAmount(record["入金"]),
          withdrawal_count: parseCount(record["出金件数"]),
          withdrawal_amount: parseAmount(record["出金"]),
          input_cash: parseAmount(record["[入力] 現金"]),
          input_credit: parseAmount(record["[入力] クレジット"]),
          input_point: parseAmount(record["[入力] ポイント"]),
          input_electronic_money: parseAmount(record["[入力] 電子マネー"]),
          input_gift_card_no_change: parseAmount(record["[入力] 商品券(釣無し)"]),
          input_gift_card_with_change: parseAmount(record["[入力] 商品券(釣有り)"]),
          input_credit_sale: parseAmount(record["[入力] 掛売"]),
          total_difference: parseAmount(record["差異合計"]),
          difference_reason: record["差異理由"] || null,
          opening_fund: parseAmount(record["開店準備金"]),
          store_deposit: parseAmount(record["店舗保管金"]),
          bank_transfer: parseAmount(record["銀行振込"]),
          safe_deposit: parseAmount(record["貸金庫預け"]),
          security_deposit: parseAmount(record["警備会社預け"]),
        };

        // 既存データの確認
        const existingRecord = await prisma.registerClose.findFirst({
          where: {
            date: registerCloseData.date,
            store_id: store.id,
          },
        });

        if (existingRecord) {
          // 既存データの更新
          console.log(`${dateStr}のレジクローズデータを更新します。`);
          await prisma.registerClose.update({
            where: { id: existingRecord.id },
            data: registerCloseData,
          });
        } else {
          // 新規データの作成
          console.log(`${dateStr}のレジクローズデータを作成します。`);
          await prisma.registerClose.create({
            data: registerCloseData,
          });
        }

        importedCount++;
      } catch (innerError: unknown) {
        errorCount++;
        const errorMessage = innerError instanceof Error ? innerError.message : "不明なエラー";
        errors.push({
          row: record,
          message: errorMessage,
        });
        console.error(
          `Error processing row: ${JSON.stringify(record)} - ${errorMessage}`
        );
      }
    }

    if (errorCount > 0) {
      return NextResponse.json(
        {
          message: `${importedCount} 件のレジクローズデータをインポートしました。${errorCount} 件のエラーがありました。`,
          errors: errors,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({
        message: `${importedCount} 件のレジクローズデータが正常にインポートされました。`,
      });
    }
  } catch (error: unknown) {
    console.error("Failed to upload register close CSV:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      {
        error: "CSVのアップロードと処理に失敗しました。",
        details: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 