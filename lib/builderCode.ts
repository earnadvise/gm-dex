import { Attribution } from "ox/erc8021";
import { concat, Hex } from "viem";

export const BUILDER_CODE = process.env.NEXT_PUBLIC_BUILDER_CODE || "6a488e6c2876ee6c1138a856";

/**
 * Appends the Base Builder Code (ERC-8021) to transaction calldata for ecosystem fee attribution.
 */
export function appendBuilderCode(calldata: string | undefined): Hex | undefined {
  if (!calldata) return undefined;
  try {
    const cleanCalldata = calldata.startsWith("0x") ? calldata : `0x${calldata}`;
    const suffix = Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
    return concat([cleanCalldata as Hex, suffix]);
  } catch (error) {
    console.error("Error appending builder code:", error);
    return calldata as Hex;
  }
}
