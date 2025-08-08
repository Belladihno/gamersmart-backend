import { hash, compare } from "bcryptjs";
import { createHmac } from "crypto";

const doHash = (value, saltvalue) => {
  const result = hash(value, saltvalue);
  return result;
};

const doHashValidation = (value, saltvalue) => {
  const result = compare(value, saltvalue);
  return result;
};

const hmacProcess = (value, key) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};

export default { doHash, doHashValidation, hmacProcess };
