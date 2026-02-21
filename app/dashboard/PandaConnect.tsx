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
import { malcoSubCategories } from "@/data/data";
import { Skeleton } from "@/components/ui/skeleton";

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
    [],
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

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (role === "Admin") return;

    const init = async () => {
      try {
        setPageLoading(true);

        // run in parallel
        await Promise.all([
          getUserData(),
          fetchMalcoCategories(),
          fetchMalcoSubCategories(),
        ]);
      } finally {
        setPageLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const createCharts = (
    userTP?: PortfolioItemProps[],
    userCB?: AggregatedClosingBalanceProps[],
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
      Object.entries(cb).map(([k, v]) => [normalize(k), v]),
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

    const labelsArray = rows.map((r) => r.label);
    const valuesArray = rows.map((r) => r.value);

    // Update state
    setClosingBalanceData(valuesArray);
    setClosingBalanceLabels(labelsArray);
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
          (asset: any) => asset.longName === item.name,
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
    setUserClosingBalance(userCB.tableData);

    createCharts(portfolioData, userCB.chartData);

    return true;
  };

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
        selectedCategoryName ? item.category === selectedCategoryName : true,
      )
      .filter((item) =>
        selectedSubCategoryName
          ? item.subCategory === selectedSubCategoryName
          : true,
      )
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [
    userTotalPortfolio,
    selectedCategoryId,
    selectedSubCategoryId,
    categoryIdToName,
    subCategoryIdToName,
  ]);

  const PandaConnectSkeleton = () => {
    return (
      <div className="space-y-6">
        <div className="mt-5">
          <Skeleton className="h-6 w-32 mb-5 shimmer rounded-md" />

          <div className="flex flex-col xl:flex-row gap-8 mb-5">
            <div className="w-full xl:w-2/3 bg-white p-4 rounded">
              <Skeleton className="h-4 w-40 mb-3 shimmer rounded-md" />
              <Skeleton className="h-[400px] w-full shimmer rounded-md" />
            </div>

            <div className="w-full xl:w-1/3 bg-white p-4 rounded">
              <Skeleton className="h-4 w-40 mb-3 shimmer rounded-md" />
              <Skeleton className="h-[350px] w-full shimmer rounded-md" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-44 mb-4 shimmer rounded-md" />
          <Skeleton className="h-[120px] w-full shimmer rounded-md" />
        </div>

        <div>
          <Skeleton className="h-6 w-44 mb-4 shimmer rounded-md" />
          <Skeleton className="h-[240px] w-full shimmer rounded-md" />
        </div>
      </div>
    );
  };

  if (pageLoading) {
    return <PandaConnectSkeleton />;
  }

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
                colors={["#416364", "#E5E7EB", "#9CA3AF", "#D1D5DB"]}
              />
            </div>
          </div>
        </div>
      </div>
      <p className="my-5 text-lg font-semibold">Closing Balance</p>
      {userClosingBalance?.length ? (
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-fixed border text-sm min-w-[520px] sm:min-w-0">
            <TableHeader className="bg-primaryBG text-white text-xs">
              <TableRow>
                {[
                  "Cash (AED)",
                  "Fixed Income (AED)",
                  "Equity (AED)",
                  "Real Estate (AED)",
                ].map((col, index) => (
                  <TableHead
                    key={index}
                    className="w-1/4 text-white font-bold border whitespace-nowrap px-3 py-2"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {userClosingBalance.map(
                (item: AggregatedClosingBalanceProps, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="w-1/4 border whitespace-nowrap px-3 py-2">
                      {item.cash?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell className="w-1/4 border whitespace-nowrap px-3 py-2">
                      {item.fixedIncome?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell className="w-1/4 border whitespace-nowrap px-3 py-2">
                      {item.equity?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell className="w-1/4 border whitespace-nowrap px-3 py-2">
                      {item.realEstate?.toLocaleString() ?? "-"}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="my-5 text-center text-gray-500">No Data to show</div>
      )}
      <p className="my-5 text-lg font-semibold">Total Portfolio</p>
      {/* --- NEW: Filters --- */}
      <div className="flex gap-10 flex-wrap mb-10">
        <div className="flex flex-wrap gap-2">
          {/* All Category */}
          <div
            className={`${selectedCategoryId === "all" ? "bg-primaryBG text-white" : "bg-gray-200 text-gray-700"} text-sm px-3 py-1 rounded-md cursor-pointer`}
            onClick={() => {
              setSelectedCategoryId("all");
            }}
          >
            All
          </div>

          {/* Dynamic Categories */}
          {malcoCategoryList.map((cat) => {
            const isActive = selectedCategoryId === cat._id;

            return (
              <div
                key={cat._id}
                className={`${isActive ? "bg-primaryBG text-white" : "bg-gray-200 text-gray-700"} text-sm px-3 py-1 rounded-md cursor-pointer`}
                onClick={() => {
                  setSelectedCategoryId(cat._id);
                }}
              >
                {cat.name}
              </div>
            );
          })}
        </div>
      </div>
      {filteredPortfolioForTable?.length ? (
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-fixed border text-sm min-w-[1150px] lg:min-w-0">
            {/* ✅ reliable widths */}
            <colgroup>
              <col style={{ width: "360px" }} /> {/* Asset Name */}
              <col style={{ width: "60px" }} /> {/* Category */}
              <col style={{ width: "60px" }} /> {/* Sub Category */}
              <col style={{ width: "60px" }} /> {/* Market Value */}
              <col style={{ width: "60px" }} /> {/* Cost Price */}
              <col style={{ width: "60px" }} /> {/* Unrealized */}
              <col style={{ width: "60px" }} /> {/* Dividend */}
            </colgroup>

            <TableHeader className="bg-primaryBG text-white text-xs">
              <TableRow>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2">
                  Asset Name
                </TableHead>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2">
                  Category
                </TableHead>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2">
                  Sub Category
                </TableHead>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2 text-right">
                  Market <br /> Value (AED)
                </TableHead>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2 text-right">
                  Cost <br />
                  Price (AED)
                </TableHead>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2 text-right">
                  Unrealized <br />
                  Gain/Loss (AED)
                </TableHead>
                <TableHead className="text-white font-bold border whitespace-nowrap px-3 py-2 text-right">
                  Dividend <br />
                  Received (AED)
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {filteredPortfolioForTable
                .sort((a, b) => a.category.localeCompare(b.category))
                .map((item, index) => (
                  <TableRow key={index}>
                    {/* Asset name: truncate but keep full on hover */}
                    <TableCell className="border px-3 py-2">
                      <div className="truncate" title={item.userAsset}>
                        {item.userAsset}
                      </div>
                    </TableCell>
                    <TableCell className="border whitespace-nowrap px-3 py-2">
                      {item.category}
                    </TableCell>

                    <TableCell className="border whitespace-nowrap px-3 py-2">
                      {item.subCategory}
                    </TableCell>

                    <TableCell className="border whitespace-nowrap text-right px-3 py-2">
                      {item.marketValue.toLocaleString()}
                    </TableCell>

                    <TableCell className="border whitespace-nowrap text-right px-3 py-2">
                      {item.costPrice.toLocaleString()}
                    </TableCell>

                    <TableCell className="border whitespace-nowrap text-right px-3 py-2">
                      {item.marketValue
                        ? (item.marketValue - item.costPrice).toLocaleString()
                        : "-"}
                    </TableCell>

                    <TableCell className="border whitespace-nowrap text-right px-3 py-2">
                      {item.costPrice
                        ? (item.costPrice - item.initialCost).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="my-5 text-center">No Data to show</div>
      )}
    </div>
  );
};

export default PandaConnect;
