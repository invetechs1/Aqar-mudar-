import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aqarmudar.sa" },
    update: {},
    create: {
      email: "admin@aqarmudar.sa",
      passwordHash,
      name: "مدير النظام",
      role: "ADMIN",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@aqarmudar.sa" },
    update: {},
    create: {
      email: "owner@aqarmudar.sa",
      passwordHash,
      name: "مالك تجريبي",
      phone: "0500000001",
      role: "OWNER",
    },
  });

  await prisma.user.upsert({
    where: { email: "investor@aqarmudar.sa" },
    update: {},
    create: {
      email: "investor@aqarmudar.sa",
      passwordHash,
      name: "مستثمر تجريبي",
      phone: "0500000002",
      role: "INVESTOR",
    },
  });

  const properties = [
    {
      title: "فيلا فاخرة في حي الياسمين",
      description:
        "فيلا حديثة بتشطيبات راقية ومساحات واسعة، تقع في موقع استراتيجي قريب من الخدمات الرئيسية. مناسبة للسكن أو الاستثمار.",
      city: "الرياض",
      district: "حي الياسمين",
      propertyType: "VILLA",
      listingType: "SALE",
      price: 3200000,
      area: 480,
      bedrooms: 6,
      bathrooms: 7,
      yearBuilt: 2019,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      ]),
      report: {
        structuralCondition: "EXCELLENT",
        finishingQuality: "GOOD",
        electricalCondition: "EXCELLENT",
        mechanicalCondition: "GOOD",
        riskLevel: "LOW",
        estimatedLifespan: 45,
        valueUpliftPotential: 12,
        upliftScope: "تحديث المطبخ وتجديد الحدائق الخارجية",
        upliftCost: 180000,
        upliftDurationMonths: 3,
        expectedReturnPct: 18,
        recommendations:
          "العقار في حالة ممتازة. يُنصح بتحديث بسيط للمطبخ لرفع القيمة السوقية بنسبة تصل إلى 12%.",
      },
    },
    {
      title: "شقة استثمارية في حي العليا (بيع جزئي)",
      description:
        "شقة في برج حديث بموقع مميز، مؤجرة حاليًا بعائد سنوي جيد. متاحة عبر البيع الجزئي — استثمر بأي حصة تناسبك.",
      city: "الرياض",
      district: "حي العليا",
      propertyType: "APARTMENT",
      listingType: "PARTIAL_SALE",
      price: 950000,
      area: 145,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2021,
      totalShares: 950,
      sharePriceSAR: 1000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      ]),
      report: {
        structuralCondition: "EXCELLENT",
        finishingQuality: "EXCELLENT",
        electricalCondition: "EXCELLENT",
        mechanicalCondition: "EXCELLENT",
        riskLevel: "LOW",
        estimatedLifespan: 50,
        valueUpliftPotential: 5,
        recommendations: "لا توجد ملاحظات هندسية. العقار جاهز للسكن أو التأجير.",
      },
    },
    {
      title: "مبنى تجاري في جدة - فرصة تطوير",
      description:
        "مبنى تجاري بحاجة إلى ترميم وتطوير. موقع ذهبي على شارع رئيسي. عائد متوقع مرتفع بعد التطوير.",
      city: "جدة",
      district: "حي الروضة",
      propertyType: "BUILDING",
      listingType: "SALE",
      price: 5800000,
      area: 720,
      yearBuilt: 2005,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      ]),
      report: {
        structuralCondition: "FAIR",
        finishingQuality: "POOR",
        electricalCondition: "FAIR",
        mechanicalCondition: "POOR",
        riskLevel: "MEDIUM",
        estimatedLifespan: 25,
        valueUpliftPotential: 35,
        upliftScope:
          "تجديد الواجهة الخارجية، استبدال أنظمة التكييف، تحديث الأنظمة الكهربائية، تجديد التشطيبات الداخلية.",
        upliftCost: 1200000,
        upliftDurationMonths: 8,
        expectedReturnPct: 42,
        recommendations:
          "فرصة تطوير قوية. الاستثمار في التجديد قد يرفع القيمة بنسبة 35% وفق دراسة Azoom United Contracting.",
      },
    },
  ];

  for (const p of properties) {
    const { report, ...propertyData } = p;
    const created = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: owner.id,
        status: "CERTIFIED",
        isCertified: true,
        report: {
          create: report,
        },
      },
    });
    console.log("Created property:", created.title);
  }

  console.log("\nSeed complete.");
  console.log("Login: admin@aqarmudar.sa / password123");
  console.log("Login: owner@aqarmudar.sa / password123");
  console.log("Login: investor@aqarmudar.sa / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
