import { useRecoilValue } from "recoil";
import { balanceAtom } from "../balance";

export const useBalance=()=>{
    const value =useRecoilValue(balanceAtom)
    return value;
}