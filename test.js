import bcrypt from "bcryptjs";

async function test() {
  const hash = await bcrypt.hash("12345", 10);

  console.log(hash);
}

test();