import { prisma } from "../src/configs/database";

const ADMIN = process.env.ADMIN;

async function CreateAdmin() {
  try {
    if (!ADMIN) {
      throw new Error("Admin details not found in env, Please add and restart the server");
    }

    const adminData = ADMIN.split("&");

    if (adminData.length !== 3) {
      throw new Error("Admin data not valid");
    }

    const findAdmin = await prisma.admin.findUnique({ where: { email: adminData[2] } });

    if (findAdmin) {
      throw new Error("Admin user already exist!, Chill");
    }

    const hashPassword = await bcrypt.hash(adminData[2], 10);

    const newData = [
      ...parseData,
      {
        id: Date.now(),
        firstName: adminData[0].split(" ")[0],
        lastName: adminData[0].split(" ")[1],
        email: adminData[1],
        password: hashPassword,
        role: "admin",
        username: adminData[0].split(" ")[0].toLowerCase(),
      },
    ];

    await fsp.writeFile(FILE_PATH, JSON.stringify(newData));

    console.log("Admin user created successfully");
  } catch (err: any) {
    console.log(err.message);
  }
}

CreateAdmin();
