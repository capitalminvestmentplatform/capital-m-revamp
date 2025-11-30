"use client";
import React, { useState, useEffect, useMemo } from "react";
import { calculatePortfolioSums, getLoggedInUser } from "@/utils/client";
import {
  AggregatedClosingBalanceProps,
  PortfolioItemProps,
} from "@/types/pandaConnect";
import Charts from "@/app/components/Charts";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { malcoSubCategories } from "@/data/data";

type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; category: string }; // category = Category._id

const PandaConnect = () => {
  const { role, name, email } = getLoggedInUser() || { role: "" };

  const [userTotalPortfolio, setUserTotalPortfolio] = useState<
    PortfolioItemProps[]
  >([]);
  const [userClosingBalance, setUserClosingBalance] = useState<
    AggregatedClosingBalanceProps[]
  >([]);
  const [closingBalanceData, setClosingBalanceData] = useState<number[]>([]);
  const [closingBalanceLabels, setClosingBalanceLabels] = useState<string[]>(
    []
  );
  const [closingBalanceColors, setClosingBalanceColors] = useState<string[]>(
    []
  );
  const [marketValuesData, setMarketValuesData] = useState<number[]>([]);
  const [costPriceData, setCostPriceData] = useState<number[]>([]);

  const [malcoCategoryList, setMalcoCategoryList] = useState<Category[]>([]);
  const [malcoSubCategoryList, setMalcoSubCategoryList] = useState<
    SubCategory[]
  >([]);

  // NEW: filter state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>("all");

  const fetchMalcoCategories = async () => {
    try {
      const res = await fetch("/api/malco/categories");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const result = response.data;
      setMalcoCategoryList(result);
    } catch (error) {
      return (error as Error).message;
    }
  };
  const fetchMalcoSubCategories = async () => {
    try {
      const res = await fetch("/api/malco/sub-categories");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const result = response.data;
      setMalcoSubCategoryList(result);
    } catch (error) {
      return (error as Error).message;
    }
  };

  useEffect(() => {
    if (role !== "Admin") {
      getUserData();
      fetchMalcoCategories();
      fetchMalcoSubCategories();
    }
  }, []);

  const createCharts = (
    userTP?: PortfolioItemProps[],
    userCB?: AggregatedClosingBalanceProps[]
  ) => {
    let mvArray: number[] = [];
    let cpArray: number[] = [];
    let currentTP = userTP || userTotalPortfolio;
    let currentCB = userCB || userClosingBalance;

    const categoryOrder = ["Cash", "Equity", "Fixed Income", "Real Estate"];
    const filteredTP = currentTP;
    const groupedData = filteredTP.reduce<
      Record<string, { marketValue: number; costPrice: number }>
    >((acc, item) => {
      const { category, marketValue, costPrice } = item;
      if (!acc[category]) {
        acc[category] = { marketValue: 0, costPrice: 0 };
      }
      acc[category].marketValue += marketValue;
      acc[category].costPrice += costPrice;
      return acc;
    }, {});

    categoryOrder.forEach((category) => {
      mvArray.push(groupedData[category]?.marketValue || 0);
      cpArray.push(groupedData[category]?.costPrice || 0);
    });

    setMarketValuesData(mvArray);
    setCostPriceData(cpArray);

    const cb = Array.isArray(currentCB) ? currentCB[0] : currentCB;

    const stringToColor = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = "#";
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff; // get 0–255
        color += ("00" + value.toString(16)).slice(-2); // pad to 2 hex digits
      }
      return color;
    };

    // Normalize: "UAE Equity" → "uaeequity", "uAEEquity" → "uaeequity"
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Map labels that have different backend key names
    // (e.g., "Income Funds" label corresponds to "fixedIncome" key)
    const LABEL_TO_CB_KEY: Record<string, string> = {
      incomefunds: "fixedincome",
      // add more if you have other mismatches, e.g.:
      // pevc: "pevc", clofund: "clofund", wakalainvestment: "wakalainvestment",
    };

    const cbMap: Record<string, number | null | undefined> = Object.fromEntries(
      Object.entries(cb).map(([k, v]) => [normalize(k), v])
    );

    // Build arrays from your label list, keeping only non-zero numeric values
    const rows = malcoSubCategories
      .map(({ name }) => {
        const normLabel = normalize(name);
        const lookup = LABEL_TO_CB_KEY[normLabel] ?? normLabel;
        const value = cbMap[lookup];
        return typeof value === "number" && value !== 0
          ? { label: name, value }
          : null;
      })
      .filter((x): x is { label: string; value: number } => x !== null);

    const colorsArray = rows.map((r) => stringToColor(r.label));
    const labelsArray = rows.map((r) => r.label);
    const valuesArray = rows.map((r) => r.value);

    // Update state
    setClosingBalanceData(valuesArray);
    setClosingBalanceLabels(labelsArray);
    setClosingBalanceColors(colorsArray);
  };

  const fetchMalcoAssets = async () => {
    try {
      const res = await fetch("/api/malco/malco-assets", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const malcoAssets = response.data;

      return malcoAssets;
    } catch (error) {
    } finally {
    }
  };

  const fetchAdminAssets = async () => {
    try {
      const res = await fetch(`/api/malco/admin-investments?email=${email}`, {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const adminAssets = response.data;
      return adminAssets;
    } catch (error) {
    } finally {
    }
  };

  const getUserData = async () => {
    let portfolioData: PortfolioItemProps[] = [];

    const { portfolioId } = getLoggedInUser() || { portfolioId: "" };

    const malcoAssets = await fetchMalcoAssets();
    let adminAssets = await fetchAdminAssets();

    adminAssets = adminAssets.map((asset: any) => {
      return {
        category: asset?.category,
        subCategory: asset?.subCategory,
        userAsset: asset?.userAsset,
        costPrice: Math.trunc(Math.abs(asset.costPrice)),
        marketValue: Math.trunc(Math.abs(asset.marketValue)),
        initialCost: Math.trunc(Math.abs(asset.initialCost)),
      };
    });
    try {
      const res = await fetch("/api/panda-connect", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: portfolioId }),
      });

      let response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      let maData = response.data;

      maData = maData.filter((item: any) => item.mv !== 0);
      maData = maData.map((item: any) => {
        const filteredAsset = malcoAssets.find(
          (asset: any) => asset.longName === item.name
        );
        return {
          category: filteredAsset?.category,
          subCategory: filteredAsset?.subCategory,
          userAsset: filteredAsset?.longName,
          costPrice: Math.trunc(Math.abs(item.cp)),
          marketValue: Math.trunc(Math.abs(item.mv)),
          initialCost: Math.trunc(Math.abs(item.ic)),
        };
      });
      maData = maData.filter((item: any) => item.category !== undefined);
      portfolioData = [...maData, ...adminAssets];
      setUserTotalPortfolio(portfolioData);
    } catch (error) {}
    const userCB = calculatePortfolioSums(portfolioData || []);

    setUserClosingBalance(userCB);

    createCharts(portfolioData, userCB);
  };

  const filteredSubCategories = useMemo(() => {
    if (selectedCategoryId === "all") return malcoSubCategoryList;
    return malcoSubCategoryList.filter(
      (s) => s.category === selectedCategoryId
    );
  }, [malcoSubCategoryList, selectedCategoryId]);

  const categoryIdToName = useMemo(() => {
    const m: Record<string, string> = {};
    malcoCategoryList.forEach((c) => (m[c._id] = c.name));
    return m;
  }, [malcoCategoryList]);

  const subCategoryIdToName = useMemo(() => {
    const m: Record<string, string> = {};
    malcoSubCategoryList.forEach((s) => (m[s._id] = s.name));
    return m;
  }, [malcoSubCategoryList]);

  const filteredPortfolioForTable = useMemo(() => {
    const selectedCategoryName =
      selectedCategoryId !== "all" ? categoryIdToName[selectedCategoryId] : "";
    const selectedSubCategoryName =
      selectedSubCategoryId !== "all"
        ? subCategoryIdToName[selectedSubCategoryId]
        : "";

    return userTotalPortfolio
      .filter((item) =>
        selectedCategoryName ? item.category === selectedCategoryName : true
      )
      .filter((item) =>
        selectedSubCategoryName
          ? item.subCategory === selectedSubCategoryName
          : true
      )
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [
    userTotalPortfolio,
    selectedCategoryId,
    selectedSubCategoryId,
    categoryIdToName,
    subCategoryIdToName,
  ]);

  // Handlers: when category changes, reset subcategory
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSubCategoryId("all"); // reset subcategory
  };

  const clearFilters = () => {
    setSelectedCategoryId("all");
    setSelectedSubCategoryId("all");
  };

  return (
    <div className="">
      <div className="mt-5">
        <h2 className="mb-5 text-lg font-semibold">Charts</h2>
        <div className="flex flex-col xl:flex-row gap-8 mb-5">
          <div className="w-full xl:w-2/3">
            <h4 className="font-medium mb-2">Total Portfolio</h4>
            <div id="chart" className="bg-white p-4">
              <Charts
                type="Bar"
                dataset1={{ label: "Market Value", data: marketValuesData }}
                dataset2={{ label: "Cost Price", data: costPriceData }}
                labels={["Cash", "Equity", "Fixed Income", "Real Estate"]}
              />
            </div>
          </div>

          <div className="w-full xl:w-1/3" style={{ height: "530px" }}>
            <h4 className="font-medium mb-2">Portfolio Value</h4>
            <div className="bg-white p-4 h-full">
              <Charts
                type="Pie"
                dataset1={{
                  label: "Closing Balance",
                  data: closingBalanceData,
                }}
                labels={closingBalanceLabels}
                colors={closingBalanceColors}
              />
            </div>
          </div>
        </div>
      </div>
      <hr />
      <p className="my-5 text-lg font-semibold">Closing Balance</p>
      {userClosingBalance?.length ? (
        <Table className="border text-sm">
          <TableHeader className="bg-primaryBG text-white text-xs">
            <TableRow>
              {[
                "Cash (AED)",
                "Fixed Income (AED)",
                "Equity (AED)",
                "Real Estate (AED)",
              ].map((col, index) => (
                <TableHead key={index} className="text-white font-bold border">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {userClosingBalance.map(
              (item: AggregatedClosingBalanceProps, index: number) => (
                <TableRow key={index}>
                  <TableCell className="border">
                    {item.cash.toLocaleString() ?? "-"}
                  </TableCell>
                  <TableCell className="border">
                    {item.fixedIncome.toLocaleString() ?? "-"}
                  </TableCell>
                  <TableCell className="border">
                    {item.equity.toLocaleString() ?? "-"}
                  </TableCell>
                  <TableCell className="border">
                    {item.realEstate.toLocaleString() ?? "-"}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="my-5 text-center text-gray-500">No Data to show</div>
      )}
      <p className="my-5 text-lg font-semibold">Total Portfolio</p>
      {/* --- NEW: Filters --- */}
      <div className="flex gap-10 flex-wrap mb-10">
        <div className="">
          <Label>Select Category</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={(v) => {
              setSelectedCategoryId(v);
              setSelectedSubCategoryId("all"); // reset subcat on category change
            }}
          >
            <SelectTrigger id="category" className="w-fit min-w-60 mt-2">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {malcoCategoryList.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <Label>Select Sub Category</Label>
          <Select
            value={selectedSubCategoryId}
            onValueChange={setSelectedSubCategoryId}
            // Optional: disable if no subcategories available
            disabled={!filteredSubCategories.length}
          >
            <SelectTrigger id="subcategory" className="w-fit min-w-60 mt-2">
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filteredSubCategories.map((sub) => (
                <SelectItem key={sub._id} value={sub._id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredPortfolioForTable?.length ? (
        <Table className="border text-sm">
          <TableHeader className="bg-primaryBG text-white text-xs">
            <TableRow>
              {[
                "Category",
                "Sub Category",
                "Asset Name",
                "Market Value (AED)",
                "Cost Price (AED)",
                "Initial Cost (AED)",
                "Unrealized Gain/Loss (AED)",
                "Total Profit (AED)",
              ].map((col, index) => (
                <TableHead key={index} className="text-white font-bold border">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filteredPortfolioForTable
              .sort((a, b) => a.category.localeCompare(b.category))
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="border">{item.category}</TableCell>
                  <TableCell className="border">{item.subCategory}</TableCell>
                  <TableCell className="border">{item.userAsset}</TableCell>
                  <TableCell className="border">
                    {item.marketValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="border">
                    {item.costPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="border">
                    {item.initialCost.toLocaleString()}
                  </TableCell>

                  <TableCell className="border">
                    {item.marketValue
                      ? (item.marketValue - item.costPrice).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="border">
                    {item.costPrice
                      ? (item.costPrice - item.initialCost).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <div className="my-5 text-center">No Data to show</div>
      )}
    </div>
  );
};

export default PandaConnect;
