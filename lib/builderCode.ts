import { Attribution } from "ox/erc8021";
import { concat, Hex } from "viem";

export const BUILDER_CODE = process.env.NEXT_PUBLIC_BUILDER_CODE || "bc_jr1lqf3i";

/**
 * Appends the Builder Code to transaction calldata for transaction attribution.
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
