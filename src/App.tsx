const React = __vite__cjsImport0_react; const useState = __vite__cjsImport0_react["useState"]; const useEffect = __vite__cjsImport0_react["useEffect"];const _jsxDEV = __vite__cjsImport15_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=6a7c9939";
import { storageService, DEFAULT_SETTINGS, DEFAULT_MONTHLY_BUDGET, DEFAULT_DAILY_BUDGET } from "/src/services/storage.ts";
import { Header } from "/src/components/Header.tsx";
import { FourQuadrants } from "/src/components/FourQuadrants.tsx";
import { MonthlyDetailsView } from "/src/components/MonthlyDetailsView.tsx";
import { DailyDetailsView } from "/src/components/DailyDetailsView.tsx";
import { AdminView } from "/src/components/AdminView.tsx";
import { NavigationTabBar } from "/src/components/NavigationTabBar.tsx";
import { MonthlyBudgetModal } from "/src/components/MonthlyBudgetModal.tsx";
import { MonthlyExpenseModal } from "/src/components/MonthlyExpenseModal.tsx";
import { DailyBudgetModal } from "/src/components/DailyBudgetModal.tsx";
import { DailyExpenseModal } from "/src/components/DailyExpenseModal.tsx";
import { AdminAuthModal } from "/src/components/AdminAuthModal.tsx";
import { ExpiredUserModal } from "/src/components/ExpiredUserModal.tsx";
import { playOverBudgetVoiceAlert } from "/src/services/soundAlert.ts";
var _jsxFileName = "/app/applet/src/App.tsx";
import __vite__cjsImport15_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=6a7c9939";
export default function App() {
	// Application Data States
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [monthlyBudget, setMonthlyBudget] = useState(DEFAULT_MONTHLY_BUDGET);
	const [dailyBudget, setDailyBudget] = useState(DEFAULT_DAILY_BUDGET);
	const [monthlyExpenses, setMonthlyExpenses] = useState([]);
	const [dailyExpenses, setDailyExpenses] = useState([]);
	const [userLinks, setUserLinks] = useState([]);
	// Navigation State
	const [activePage, setActivePage] = useState("dashboard");
	// Admin and User View States
	const [isAdmin, setIsAdmin] = useState(false);
	const [isUserView, setIsUserView] = useState(false);
	const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
	// Expired User Modal States
	const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
	const [expiredUserName, setExpiredUserName] = useState("");
	const [isTestExpiredModal, setIsTestExpiredModal] = useState(false);
	// Modals States
	const [isMonthlyBudgetModalOpen, setIsMonthlyBudgetModalOpen] = useState(false);
	const [isMonthlyExpenseModalOpen, setIsMonthlyExpenseModalOpen] = useState(false);
	const [editingMonthlyExpense, setEditingMonthlyExpense] = useState(null);
	const [isDailyBudgetModalOpen, setIsDailyBudgetModalOpen] = useState(false);
	const [isDailyExpenseModalOpen, setIsDailyExpenseModalOpen] = useState(false);
	const [editingDailyExpense, setEditingDailyExpense] = useState(null);
	// Load Initial Data on Mount
	useEffect(() => {
		const loadedSettings = storageService.getAppSettings();
		const loadedMonthlyBudget = storageService.getMonthlyBudget();
		const loadedDailyBudget = storageService.getDailyBudget();
		const loadedMonthlyExpenses = storageService.getMonthlyExpenses();
		const loadedDailyExpenses = storageService.getDailyExpenses();
		const loadedUserLinks = storageService.getUserLinks();
		setSettings(loadedSettings);
		setMonthlyBudget(loadedMonthlyBudget);
		setDailyBudget(loadedDailyBudget);
		setMonthlyExpenses(loadedMonthlyExpenses);
		setDailyExpenses(loadedDailyExpenses);
		setUserLinks(loadedUserLinks);
		// Check URL parameters for User Token or Admin
		const searchParams = new URLSearchParams(window.location.search);
		const userParam = searchParams.get("user");
		const adminParam = searchParams.get("admin");
		if (userParam) {
			setIsUserView(true);
			// Check if user token exists and is valid
			const foundUser = loadedUserLinks.find((u) => u.token === userParam);
			if (foundUser) {
				const isExpired = new Date(foundUser.expiresAt).getTime() < Date.now();
				if (isExpired) {
					setExpiredUserName(foundUser.userName);
					setIsExpiredModalOpen(true);
				}
			} else {
				// If unrecognized user token or mock expired token
				if (userParam.includes("expired")) {
					setExpiredUserName("ผู้ใช้ทดสอบ");
					setIsExpiredModalOpen(true);
				}
			}
		}
		if (adminParam === "true") {
			setIsAdminAuthOpen(true);
		}
	}, []);
	// Sync document title with current app name and revision
	useEffect(() => {
		document.title = `${settings.appName} (${settings.revision}) - ระบบจัดการงบและค่าใช้จ่าย`;
	}, [settings.appName, settings.revision]);
	// Save Handlers
	const handleSaveMonthlyBudget = (newBudget) => {
		setMonthlyBudget(newBudget);
		storageService.saveMonthlyBudget(newBudget);
	};
	const handleSaveDailyBudget = (newBudget) => {
		setDailyBudget(newBudget);
		storageService.saveDailyBudget(newBudget);
	};
	const handleSaveMonthlyExpense = (expenseData, existingId) => {
		let updated;
		if (existingId) {
			updated = monthlyExpenses.map((item) => item.id === existingId ? {
				...item,
				...expenseData
			} : item);
		} else {
			const newItem = {
				...expenseData,
				id: `m-${Date.now()}`,
				createdAt: new Date().toISOString()
			};
			updated = [newItem, ...monthlyExpenses];
		}
		setMonthlyExpenses(updated);
		storageService.saveMonthlyExpenses(updated);
		setEditingMonthlyExpense(null);
	};
	const handleDeleteMonthlyExpense = (id) => {
		const updated = monthlyExpenses.filter((item) => item.id !== id);
		setMonthlyExpenses(updated);
		storageService.saveMonthlyExpenses(updated);
	};
	const handleToggleMonthlyStatus = (id) => {
		const updated = monthlyExpenses.map((item) => {
			if (item.id !== id) return item;
			const nextIsPaid = !item.isPaid;
			return {
				...item,
				isPaid: nextIsPaid,
				paidAt: nextIsPaid ? new Date().toISOString() : undefined
			};
		});
		setMonthlyExpenses(updated);
		storageService.saveMonthlyExpenses(updated);
	};
	const handleSaveDailyExpense = (expenseData, existingId) => {
		let updated;
		if (existingId) {
			updated = dailyExpenses.map((item) => item.id === existingId ? {
				...item,
				...expenseData
			} : item);
		} else {
			const newItem = {
				...expenseData,
				id: `d-${Date.now()}`,
				createdAt: new Date().toISOString()
			};
			updated = [newItem, ...dailyExpenses];
		}
		setDailyExpenses(updated);
		storageService.saveDailyExpenses(updated);
		setEditingDailyExpense(null);
		// 2.2) หากมีรายการที่เพิ่มล่าสุดทำให้เกินงบประจำวัน ให้มีเสียงเตือนดังขึ้น 2-3 รอบ:
		// "วันนี้รายจ่ายเกินงบ พรุ่งนี้เริ่มใหม่นะครับ สู้ๆครับ"
		const currentToday = new Date().toISOString().split("T")[0];
		const totalTodayAfter = updated.filter((e) => e.date === currentToday).reduce((sum, e) => sum + e.amount, 0);
		if (totalTodayAfter > (dailyBudget.amount || 0)) {
			playOverBudgetVoiceAlert(3);
		}
	};
	const handleDeleteDailyExpense = (id) => {
		const updated = dailyExpenses.filter((item) => item.id !== id);
		setDailyExpenses(updated);
		storageService.saveDailyExpenses(updated);
	};
	const handleSaveSettings = (newSettings) => {
		setSettings(newSettings);
		storageService.saveAppSettings(newSettings);
	};
	const handleSaveUserLinks = (newLinks) => {
		setUserLinks(newLinks);
		storageService.saveUserLinks(newLinks);
	};
	// Monthly spent calculation
	const monthlyTotalCommitted = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
	const todayStr = new Date().toISOString().split("T")[0];
	const currentMonthStr = todayStr.substring(0, 7);
	const thisMonthDailySpent = dailyExpenses.filter((e) => e.date.startsWith(currentMonthStr)).reduce((sum, item) => sum + item.amount, 0);
	const totalMonthlySpentCombined = monthlyTotalCommitted + thisMonthDailySpent;
	// Daily spent calculation
	const todayDailySpent = dailyExpenses.filter((e) => e.date === todayStr).reduce((sum, item) => sum + item.amount, 0);
	// Tab navigation handler
	const handleSelectPage = (page) => {
		if (page === "admin" && !isAdmin) {
			setIsAdminAuthOpen(true);
			return;
		}
		setActivePage(page);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ _jsxDEV("div", {
		className: "min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16",
		children: [
			/* @__PURE__ */ _jsxDEV(Header, {
				settings,
				monthlyBudget,
				monthlySpent: totalMonthlySpentCombined,
				dailyBudget,
				dailySpent: todayDailySpent,
				onOpenAdminAuth: () => {
					if (isAdmin) {
						setActivePage("admin");
					} else {
						setIsAdminAuthOpen(true);
					}
				},
				isAdmin,
				isUserView
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 245,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV("main", {
				className: "flex-1 w-full",
				children: [
					activePage === "dashboard" && /* @__PURE__ */ _jsxDEV(FourQuadrants, {
						monthlyBudget,
						dailyBudget,
						monthlyExpenses,
						dailyExpenses,
						onOpenMonthlyBudgetModal: () => setIsMonthlyBudgetModalOpen(true),
						onOpenMonthlyExpenseModal: () => {
							setEditingMonthlyExpense(null);
							setIsMonthlyExpenseModalOpen(true);
						},
						onOpenDailyBudgetModal: () => setIsDailyBudgetModalOpen(true),
						onOpenDailyExpenseModal: () => {
							setEditingDailyExpense(null);
							setIsDailyExpenseModalOpen(true);
						}
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 266,
						columnNumber: 11
					}, this),
					activePage === "monthly" && /* @__PURE__ */ _jsxDEV(MonthlyDetailsView, {
						expenses: monthlyExpenses,
						dailyExpenses,
						onBack: () => setActivePage("dashboard"),
						onOpenAddModal: () => {
							setEditingMonthlyExpense(null);
							setIsMonthlyExpenseModalOpen(true);
						},
						onEditExpense: (item) => {
							setEditingMonthlyExpense(item);
							setIsMonthlyExpenseModalOpen(true);
						},
						onDeleteExpense: handleDeleteMonthlyExpense,
						onToggleStatus: handleToggleMonthlyStatus
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 286,
						columnNumber: 11
					}, this),
					activePage === "daily" && /* @__PURE__ */ _jsxDEV(DailyDetailsView, {
						expenses: dailyExpenses,
						onBack: () => setActivePage("dashboard"),
						onOpenAddModal: () => {
							setEditingDailyExpense(null);
							setIsDailyExpenseModalOpen(true);
						},
						onEditExpense: (item) => {
							setEditingDailyExpense(item);
							setIsDailyExpenseModalOpen(true);
						},
						onDeleteExpense: handleDeleteDailyExpense
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 305,
						columnNumber: 11
					}, this),
					activePage === "admin" && /* @__PURE__ */ _jsxDEV(AdminView, {
						settings,
						userLinks,
						onBack: () => setActivePage("dashboard"),
						onSaveSettings: handleSaveSettings,
						onSaveUserLinks: handleSaveUserLinks,
						onTestExpiredModal: () => {
							setIsTestExpiredModal(true);
							setIsExpiredModalOpen(true);
						},
						onLogoutAdmin: () => {
							setIsAdmin(false);
							setActivePage("dashboard");
						}
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 322,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 263,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(NavigationTabBar, {
				activePage,
				onSelectPage: handleSelectPage,
				isAdmin,
				isUserView,
				monthlyCount: monthlyExpenses.length,
				dailyCount: dailyExpenses.length
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 341,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(MonthlyBudgetModal, {
				isOpen: isMonthlyBudgetModalOpen,
				onClose: () => setIsMonthlyBudgetModalOpen(false),
				currentBudget: monthlyBudget,
				onSave: handleSaveMonthlyBudget
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 354,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(MonthlyExpenseModal, {
				isOpen: isMonthlyExpenseModalOpen,
				onClose: () => {
					setIsMonthlyExpenseModalOpen(false);
					setEditingMonthlyExpense(null);
				},
				onSave: handleSaveMonthlyExpense,
				onDelete: handleDeleteMonthlyExpense,
				initialData: editingMonthlyExpense
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 362,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(DailyBudgetModal, {
				isOpen: isDailyBudgetModalOpen,
				onClose: () => setIsDailyBudgetModalOpen(false),
				currentBudget: dailyBudget,
				onSave: handleSaveDailyBudget
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 374,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(DailyExpenseModal, {
				isOpen: isDailyExpenseModalOpen,
				onClose: () => {
					setIsDailyExpenseModalOpen(false);
					setEditingDailyExpense(null);
				},
				onSave: handleSaveDailyExpense,
				onDelete: handleDeleteDailyExpense,
				initialData: editingDailyExpense
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 382,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(AdminAuthModal, {
				isOpen: isAdminAuthOpen,
				onClose: () => setIsAdminAuthOpen(false),
				onSuccess: () => {
					setIsAdmin(true);
					setIsAdminAuthOpen(false);
					setActivePage("admin");
				}
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 394,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(ExpiredUserModal, {
				isOpen: isExpiredModalOpen,
				onClose: () => {
					setIsExpiredModalOpen(false);
					setIsTestExpiredModal(false);
				},
				adminPhone: settings.adminPhone || "099-225-6601",
				adminName: settings.adminName || "ช่างหน่อยชุมแพ",
				userName: expiredUserName,
				isTestMode: isTestExpiredModal
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 405,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 243,
		columnNumber: 5
	}, this);
}

//# sourceMappingURL=data:application/json;base64,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cUJBQUQ7SUFDRSxRQUFRO0lBQ1IsZUFBZTtLQUNiLDZCQUE2QixLQUFLO0tBQ2xDLHlCQUF5QixJQUFJO0lBQy9CO0lBQ0EsUUFBUTtJQUNSLFVBQVU7SUFDVixhQUFhO0dBQ2Q7Ozs7O0dBR0Qsd0JBQUMsa0JBQUQ7SUFDRSxRQUFRO0lBQ1IsZUFBZSwwQkFBMEIsS0FBSztJQUM5QyxlQUFlO0lBQ2YsUUFBUTtHQUNUOzs7OztHQUdELHdCQUFDLG1CQUFEO0lBQ0UsUUFBUTtJQUNSLGVBQWU7S0FDYiwyQkFBMkIsS0FBSztLQUNoQyx1QkFBdUIsSUFBSTtJQUM3QjtJQUNBLFFBQVE7SUFDUixVQUFVO0lBQ1YsYUFBYTtHQUNkOzs7OztHQUdELHdCQUFDLGdCQUFEO0lBQ0UsUUFBUTtJQUNSLGVBQWUsbUJBQW1CLEtBQUs7SUFDdkMsaUJBQWlCO0tBQ2YsV0FBVyxJQUFJO0tBQ2YsbUJBQW1CLEtBQUs7S0FDeEIsY0FBYyxPQUFPO0lBQ3ZCO0dBQ0Q7Ozs7O0dBR0Qsd0JBQUMsa0JBQUQ7SUFDRSxRQUFRO0lBQ1IsZUFBZTtLQUNiLHNCQUFzQixLQUFLO0tBQzNCLHNCQUFzQixLQUFLO0lBQzdCO0lBQ0EsWUFBWSxTQUFTLGNBQWM7SUFDbkMsV0FBVyxTQUFTLGFBQWE7SUFDakMsVUFBVTtJQUNWLFlBQVk7R0FDYjs7Ozs7RUFDRTs7Ozs7O0FBRVQiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiQXBwLnRzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIE1vbnRobHlCdWRnZXRDb25maWcsXG4gIERhaWx5QnVkZ2V0Q29uZmlnLFxuICBNb250aGx5RXhwZW5zZSxcbiAgRGFpbHlFeHBlbnNlLFxuICBVc2VyTGluayxcbiAgQXBwU2V0dGluZ3MsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtcbiAgc3RvcmFnZVNlcnZpY2UsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIERFRkFVTFRfTU9OVEhMWV9CVURHRVQsXG4gIERFRkFVTFRfREFJTFlfQlVER0VULFxufSBmcm9tICcuL3NlcnZpY2VzL3N0b3JhZ2UnO1xuXG5pbXBvcnQgeyBIZWFkZXIgfSBmcm9tICcuL2NvbXBvbmVudHMvSGVhZGVyJztcbmltcG9ydCB7IEZvdXJRdWFkcmFudHMgfSBmcm9tICcuL2NvbXBvbmVudHMvRm91clF1YWRyYW50cyc7XG5pbXBvcnQgeyBNb250aGx5RGV0YWlsc1ZpZXcgfSBmcm9tICcuL2NvbXBvbmVudHMvTW9udGhseURldGFpbHNWaWV3JztcbmltcG9ydCB7IERhaWx5RGV0YWlsc1ZpZXcgfSBmcm9tICcuL2NvbXBvbmVudHMvRGFpbHlEZXRhaWxzVmlldyc7XG5pbXBvcnQgeyBBZG1pblZpZXcgfSBmcm9tICcuL2NvbXBvbmVudHMvQWRtaW5WaWV3JztcbmltcG9ydCB7IE5hdmlnYXRpb25UYWJCYXIsIEFjdGl2ZVBhZ2UgfSBmcm9tICcuL2NvbXBvbmVudHMvTmF2aWdhdGlvblRhYkJhcic7XG5cbmltcG9ydCB7IE1vbnRobHlCdWRnZXRNb2RhbCB9IGZyb20gJy4vY29tcG9uZW50cy9Nb250aGx5QnVkZ2V0TW9kYWwnO1xuaW1wb3J0IHsgTW9udGhseUV4cGVuc2VNb2RhbCB9IGZyb20gJy4vY29tcG9uZW50cy9Nb250aGx5RXhwZW5zZU1vZGFsJztcbmltcG9ydCB7IERhaWx5QnVkZ2V0TW9kYWwgfSBmcm9tICcuL2NvbXBvbmVudHMvRGFpbHlCdWRnZXRNb2RhbCc7XG5pbXBvcnQgeyBEYWlseUV4cGVuc2VNb2RhbCB9IGZyb20gJy4vY29tcG9uZW50cy9EYWlseUV4cGVuc2VNb2RhbCc7XG5pbXBvcnQgeyBBZG1pbkF1dGhNb2RhbCB9IGZyb20gJy4vY29tcG9uZW50cy9BZG1pbkF1dGhNb2RhbCc7XG5pbXBvcnQgeyBFeHBpcmVkVXNlck1vZGFsIH0gZnJvbSAnLi9jb21wb25lbnRzL0V4cGlyZWRVc2VyTW9kYWwnO1xuaW1wb3J0IHsgcGxheU92ZXJCdWRnZXRWb2ljZUFsZXJ0IH0gZnJvbSAnLi9zZXJ2aWNlcy9zb3VuZEFsZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKCkge1xuICAvLyBBcHBsaWNhdGlvbiBEYXRhIFN0YXRlc1xuICBjb25zdCBbc2V0dGluZ3MsIHNldFNldHRpbmdzXSA9IHVzZVN0YXRlPEFwcFNldHRpbmdzPihERUZBVUxUX1NFVFRJTkdTKTtcbiAgY29uc3QgW21vbnRobHlCdWRnZXQsIHNldE1vbnRobHlCdWRnZXRdID0gdXNlU3RhdGU8TW9udGhseUJ1ZGdldENvbmZpZz4oREVGQVVMVF9NT05USExZX0JVREdFVCk7XG4gIGNvbnN0IFtkYWlseUJ1ZGdldCwgc2V0RGFpbHlCdWRnZXRdID0gdXNlU3RhdGU8RGFpbHlCdWRnZXRDb25maWc+KERFRkFVTFRfREFJTFlfQlVER0VUKTtcbiAgY29uc3QgW21vbnRobHlFeHBlbnNlcywgc2V0TW9udGhseUV4cGVuc2VzXSA9IHVzZVN0YXRlPE1vbnRobHlFeHBlbnNlW10+KFtdKTtcbiAgY29uc3QgW2RhaWx5RXhwZW5zZXMsIHNldERhaWx5RXhwZW5zZXNdID0gdXNlU3RhdGU8RGFpbHlFeHBlbnNlW10+KFtdKTtcbiAgY29uc3QgW3VzZXJMaW5rcywgc2V0VXNlckxpbmtzXSA9IHVzZVN0YXRlPFVzZXJMaW5rW10+KFtdKTtcblxuICAvLyBOYXZpZ2F0aW9uIFN0YXRlXG4gIGNvbnN0IFthY3RpdmVQYWdlLCBzZXRBY3RpdmVQYWdlXSA9IHVzZVN0YXRlPEFjdGl2ZVBhZ2U+KCdkYXNoYm9hcmQnKTtcblxuICAvLyBBZG1pbiBhbmQgVXNlciBWaWV3IFN0YXRlc1xuICBjb25zdCBbaXNBZG1pbiwgc2V0SXNBZG1pbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpc1VzZXJWaWV3LCBzZXRJc1VzZXJWaWV3XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzQWRtaW5BdXRoT3Blbiwgc2V0SXNBZG1pbkF1dGhPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBFeHBpcmVkIFVzZXIgTW9kYWwgU3RhdGVzXG4gIGNvbnN0IFtpc0V4cGlyZWRNb2RhbE9wZW4sIHNldElzRXhwaXJlZE1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtleHBpcmVkVXNlck5hbWUsIHNldEV4cGlyZWRVc2VyTmFtZV0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtpc1Rlc3RFeHBpcmVkTW9kYWwsIHNldElzVGVzdEV4cGlyZWRNb2RhbF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgLy8gTW9kYWxzIFN0YXRlc1xuICBjb25zdCBbaXNNb250aGx5QnVkZ2V0TW9kYWxPcGVuLCBzZXRJc01vbnRobHlCdWRnZXRNb2RhbE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaXNNb250aGx5RXhwZW5zZU1vZGFsT3Blbiwgc2V0SXNNb250aGx5RXhwZW5zZU1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtlZGl0aW5nTW9udGhseUV4cGVuc2UsIHNldEVkaXRpbmdNb250aGx5RXhwZW5zZV0gPSB1c2VTdGF0ZTxNb250aGx5RXhwZW5zZSB8IG51bGw+KG51bGwpO1xuXG4gIGNvbnN0IFtpc0RhaWx5QnVkZ2V0TW9kYWxPcGVuLCBzZXRJc0RhaWx5QnVkZ2V0TW9kYWxPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzRGFpbHlFeHBlbnNlTW9kYWxPcGVuLCBzZXRJc0RhaWx5RXhwZW5zZU1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtlZGl0aW5nRGFpbHlFeHBlbnNlLCBzZXRFZGl0aW5nRGFpbHlFeHBlbnNlXSA9IHVzZVN0YXRlPERhaWx5RXhwZW5zZSB8IG51bGw+KG51bGwpO1xuXG4gIC8vIExvYWQgSW5pdGlhbCBEYXRhIG9uIE1vdW50XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbG9hZGVkU2V0dGluZ3MgPSBzdG9yYWdlU2VydmljZS5nZXRBcHBTZXR0aW5ncygpO1xuICAgIGNvbnN0IGxvYWRlZE1vbnRobHlCdWRnZXQgPSBzdG9yYWdlU2VydmljZS5nZXRNb250aGx5QnVkZ2V0KCk7XG4gICAgY29uc3QgbG9hZGVkRGFpbHlCdWRnZXQgPSBzdG9yYWdlU2VydmljZS5nZXREYWlseUJ1ZGdldCgpO1xuICAgIGNvbnN0IGxvYWRlZE1vbnRobHlFeHBlbnNlcyA9IHN0b3JhZ2VTZXJ2aWNlLmdldE1vbnRobHlFeHBlbnNlcygpO1xuICAgIGNvbnN0IGxvYWRlZERhaWx5RXhwZW5zZXMgPSBzdG9yYWdlU2VydmljZS5nZXREYWlseUV4cGVuc2VzKCk7XG4gICAgY29uc3QgbG9hZGVkVXNlckxpbmtzID0gc3RvcmFnZVNlcnZpY2UuZ2V0VXNlckxpbmtzKCk7XG5cbiAgICBzZXRTZXR0aW5ncyhsb2FkZWRTZXR0aW5ncyk7XG4gICAgc2V0TW9udGhseUJ1ZGdldChsb2FkZWRNb250aGx5QnVkZ2V0KTtcbiAgICBzZXREYWlseUJ1ZGdldChsb2FkZWREYWlseUJ1ZGdldCk7XG4gICAgc2V0TW9udGhseUV4cGVuc2VzKGxvYWRlZE1vbnRobHlFeHBlbnNlcyk7XG4gICAgc2V0RGFpbHlFeHBlbnNlcyhsb2FkZWREYWlseUV4cGVuc2VzKTtcbiAgICBzZXRVc2VyTGlua3MobG9hZGVkVXNlckxpbmtzKTtcblxuICAgIC8vIENoZWNrIFVSTCBwYXJhbWV0ZXJzIGZvciBVc2VyIFRva2VuIG9yIEFkbWluXG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICBjb25zdCB1c2VyUGFyYW0gPSBzZWFyY2hQYXJhbXMuZ2V0KCd1c2VyJyk7XG4gICAgY29uc3QgYWRtaW5QYXJhbSA9IHNlYXJjaFBhcmFtcy5nZXQoJ2FkbWluJyk7XG5cbiAgICBpZiAodXNlclBhcmFtKSB7XG4gICAgICBzZXRJc1VzZXJWaWV3KHRydWUpO1xuICAgICAgLy8gQ2hlY2sgaWYgdXNlciB0b2tlbiBleGlzdHMgYW5kIGlzIHZhbGlkXG4gICAgICBjb25zdCBmb3VuZFVzZXIgPSBsb2FkZWRVc2VyTGlua3MuZmluZCgodSkgPT4gdS50b2tlbiA9PT0gdXNlclBhcmFtKTtcbiAgICAgIGlmIChmb3VuZFVzZXIpIHtcbiAgICAgICAgY29uc3QgaXNFeHBpcmVkID0gbmV3IERhdGUoZm91bmRVc2VyLmV4cGlyZXNBdCkuZ2V0VGltZSgpIDwgRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKGlzRXhwaXJlZCkge1xuICAgICAgICAgIHNldEV4cGlyZWRVc2VyTmFtZShmb3VuZFVzZXIudXNlck5hbWUpO1xuICAgICAgICAgIHNldElzRXhwaXJlZE1vZGFsT3Blbih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdW5yZWNvZ25pemVkIHVzZXIgdG9rZW4gb3IgbW9jayBleHBpcmVkIHRva2VuXG4gICAgICAgIGlmICh1c2VyUGFyYW0uaW5jbHVkZXMoJ2V4cGlyZWQnKSkge1xuICAgICAgICAgIHNldEV4cGlyZWRVc2VyTmFtZSgn4Lic4Li54LmJ4LmD4LiK4LmJ4LiX4LiU4Liq4Lit4LiaJyk7XG4gICAgICAgICAgc2V0SXNFeHBpcmVkTW9kYWxPcGVuKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFkbWluUGFyYW0gPT09ICd0cnVlJykge1xuICAgICAgc2V0SXNBZG1pbkF1dGhPcGVuKHRydWUpO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIC8vIFN5bmMgZG9jdW1lbnQgdGl0bGUgd2l0aCBjdXJyZW50IGFwcCBuYW1lIGFuZCByZXZpc2lvblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGRvY3VtZW50LnRpdGxlID0gYCR7c2V0dGluZ3MuYXBwTmFtZX0gKCR7c2V0dGluZ3MucmV2aXNpb259KSAtIOC4o+C4sOC4muC4muC4iOC4seC4lOC4geC4suC4o+C4h+C4muC5geC4peC4sOC4hOC5iOC4suC5g+C4iuC5ieC4iOC5iOC4suC4omA7XG4gIH0sIFtzZXR0aW5ncy5hcHBOYW1lLCBzZXR0aW5ncy5yZXZpc2lvbl0pO1xuXG4gIC8vIFNhdmUgSGFuZGxlcnNcbiAgY29uc3QgaGFuZGxlU2F2ZU1vbnRobHlCdWRnZXQgPSAobmV3QnVkZ2V0OiBNb250aGx5QnVkZ2V0Q29uZmlnKSA9PiB7XG4gICAgc2V0TW9udGhseUJ1ZGdldChuZXdCdWRnZXQpO1xuICAgIHN0b3JhZ2VTZXJ2aWNlLnNhdmVNb250aGx5QnVkZ2V0KG5ld0J1ZGdldCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZURhaWx5QnVkZ2V0ID0gKG5ld0J1ZGdldDogRGFpbHlCdWRnZXRDb25maWcpID0+IHtcbiAgICBzZXREYWlseUJ1ZGdldChuZXdCdWRnZXQpO1xuICAgIHN0b3JhZ2VTZXJ2aWNlLnNhdmVEYWlseUJ1ZGdldChuZXdCdWRnZXQpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVNhdmVNb250aGx5RXhwZW5zZSA9IChcbiAgICBleHBlbnNlRGF0YTogT21pdDxNb250aGx5RXhwZW5zZSwgJ2lkJyB8ICdjcmVhdGVkQXQnPixcbiAgICBleGlzdGluZ0lkPzogc3RyaW5nXG4gICkgPT4ge1xuICAgIGxldCB1cGRhdGVkOiBNb250aGx5RXhwZW5zZVtdO1xuICAgIGlmIChleGlzdGluZ0lkKSB7XG4gICAgICB1cGRhdGVkID0gbW9udGhseUV4cGVuc2VzLm1hcCgoaXRlbSkgPT5cbiAgICAgICAgaXRlbS5pZCA9PT0gZXhpc3RpbmdJZCA/IHsgLi4uaXRlbSwgLi4uZXhwZW5zZURhdGEgfSA6IGl0ZW1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5ld0l0ZW06IE1vbnRobHlFeHBlbnNlID0ge1xuICAgICAgICAuLi5leHBlbnNlRGF0YSxcbiAgICAgICAgaWQ6IGBtLSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIH07XG4gICAgICB1cGRhdGVkID0gW25ld0l0ZW0sIC4uLm1vbnRobHlFeHBlbnNlc107XG4gICAgfVxuICAgIHNldE1vbnRobHlFeHBlbnNlcyh1cGRhdGVkKTtcbiAgICBzdG9yYWdlU2VydmljZS5zYXZlTW9udGhseUV4cGVuc2VzKHVwZGF0ZWQpO1xuICAgIHNldEVkaXRpbmdNb250aGx5RXhwZW5zZShudWxsKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVEZWxldGVNb250aGx5RXhwZW5zZSA9IChpZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlZCA9IG1vbnRobHlFeHBlbnNlcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaWQgIT09IGlkKTtcbiAgICBzZXRNb250aGx5RXhwZW5zZXModXBkYXRlZCk7XG4gICAgc3RvcmFnZVNlcnZpY2Uuc2F2ZU1vbnRobHlFeHBlbnNlcyh1cGRhdGVkKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVUb2dnbGVNb250aGx5U3RhdHVzID0gKGlkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB1cGRhdGVkID0gbW9udGhseUV4cGVuc2VzLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKGl0ZW0uaWQgIT09IGlkKSByZXR1cm4gaXRlbTtcbiAgICAgIGNvbnN0IG5leHRJc1BhaWQgPSAhaXRlbS5pc1BhaWQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5pdGVtLFxuICAgICAgICBpc1BhaWQ6IG5leHRJc1BhaWQsXG4gICAgICAgIHBhaWRBdDogbmV4dElzUGFpZCA/IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSA6IHVuZGVmaW5lZCxcbiAgICAgIH07XG4gICAgfSk7XG4gICAgc2V0TW9udGhseUV4cGVuc2VzKHVwZGF0ZWQpO1xuICAgIHN0b3JhZ2VTZXJ2aWNlLnNhdmVNb250aGx5RXhwZW5zZXModXBkYXRlZCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZURhaWx5RXhwZW5zZSA9IChcbiAgICBleHBlbnNlRGF0YTogT21pdDxEYWlseUV4cGVuc2UsICdpZCcgfCAnY3JlYXRlZEF0Jz4sXG4gICAgZXhpc3RpbmdJZD86IHN0cmluZ1xuICApID0+IHtcbiAgICBsZXQgdXBkYXRlZDogRGFpbHlFeHBlbnNlW107XG4gICAgaWYgKGV4aXN0aW5nSWQpIHtcbiAgICAgIHVwZGF0ZWQgPSBkYWlseUV4cGVuc2VzLm1hcCgoaXRlbSkgPT5cbiAgICAgICAgaXRlbS5pZCA9PT0gZXhpc3RpbmdJZCA/IHsgLi4uaXRlbSwgLi4uZXhwZW5zZURhdGEgfSA6IGl0ZW1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5ld0l0ZW06IERhaWx5RXhwZW5zZSA9IHtcbiAgICAgICAgLi4uZXhwZW5zZURhdGEsXG4gICAgICAgIGlkOiBgZC0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB9O1xuICAgICAgdXBkYXRlZCA9IFtuZXdJdGVtLCAuLi5kYWlseUV4cGVuc2VzXTtcbiAgICB9XG4gICAgc2V0RGFpbHlFeHBlbnNlcyh1cGRhdGVkKTtcbiAgICBzdG9yYWdlU2VydmljZS5zYXZlRGFpbHlFeHBlbnNlcyh1cGRhdGVkKTtcbiAgICBzZXRFZGl0aW5nRGFpbHlFeHBlbnNlKG51bGwpO1xuXG4gICAgLy8gMi4yKSDguKvguLLguIHguKHguLXguKPguLLguKLguIHguLLguKPguJfguLXguYjguYDguJ7guLTguYjguKHguKXguYjguLLguKrguLjguJTguJfguLPguYPguKvguYnguYDguIHguLTguJnguIfguJrguJvguKPguLDguIjguLPguKfguLHguJkg4LmD4Lir4LmJ4Lih4Li14LmA4Liq4Li14Lii4LiH4LmA4LiV4Li34Lit4LiZ4LiU4Lix4LiH4LiC4Li24LmJ4LiZIDItMyDguKPguK3guJo6XG4gICAgLy8gXCLguKfguLHguJnguJnguLXguYnguKPguLLguKLguIjguYjguLLguKLguYDguIHguLTguJnguIfguJog4Lie4Lij4Li44LmI4LiH4LiZ4Li14LmJ4LmA4Lij4Li04LmI4Lih4LmD4Lir4Lih4LmI4LiZ4Liw4LiE4Lij4Lix4LiaIOC4quC4ueC5ieC5huC4hOC4o+C4seC4mlwiXG4gICAgY29uc3QgY3VycmVudFRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgY29uc3QgdG90YWxUb2RheUFmdGVyID0gdXBkYXRlZFxuICAgICAgLmZpbHRlcigoZSkgPT4gZS5kYXRlID09PSBjdXJyZW50VG9kYXkpXG4gICAgICAucmVkdWNlKChzdW0sIGUpID0+IHN1bSArIGUuYW1vdW50LCAwKTtcblxuICAgIGlmICh0b3RhbFRvZGF5QWZ0ZXIgPiAoZGFpbHlCdWRnZXQuYW1vdW50IHx8IDApKSB7XG4gICAgICBwbGF5T3ZlckJ1ZGdldFZvaWNlQWxlcnQoMyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZURlbGV0ZURhaWx5RXhwZW5zZSA9IChpZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlZCA9IGRhaWx5RXhwZW5zZXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCk7XG4gICAgc2V0RGFpbHlFeHBlbnNlcyh1cGRhdGVkKTtcbiAgICBzdG9yYWdlU2VydmljZS5zYXZlRGFpbHlFeHBlbnNlcyh1cGRhdGVkKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVTYXZlU2V0dGluZ3MgPSAobmV3U2V0dGluZ3M6IEFwcFNldHRpbmdzKSA9PiB7XG4gICAgc2V0U2V0dGluZ3MobmV3U2V0dGluZ3MpO1xuICAgIHN0b3JhZ2VTZXJ2aWNlLnNhdmVBcHBTZXR0aW5ncyhuZXdTZXR0aW5ncyk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZVVzZXJMaW5rcyA9IChuZXdMaW5rczogVXNlckxpbmtbXSkgPT4ge1xuICAgIHNldFVzZXJMaW5rcyhuZXdMaW5rcyk7XG4gICAgc3RvcmFnZVNlcnZpY2Uuc2F2ZVVzZXJMaW5rcyhuZXdMaW5rcyk7XG4gIH07XG5cbiAgLy8gTW9udGhseSBzcGVudCBjYWxjdWxhdGlvblxuICBjb25zdCBtb250aGx5VG90YWxDb21taXR0ZWQgPSBtb250aGx5RXhwZW5zZXMucmVkdWNlKFxuICAgIChzdW0sIGl0ZW0pID0+IHN1bSArIGl0ZW0uYW1vdW50LFxuICAgIDBcbiAgKTtcbiAgY29uc3QgdG9kYXlTdHIgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcbiAgY29uc3QgY3VycmVudE1vbnRoU3RyID0gdG9kYXlTdHIuc3Vic3RyaW5nKDAsIDcpO1xuICBjb25zdCB0aGlzTW9udGhEYWlseVNwZW50ID0gZGFpbHlFeHBlbnNlc1xuICAgIC5maWx0ZXIoKGUpID0+IGUuZGF0ZS5zdGFydHNXaXRoKGN1cnJlbnRNb250aFN0cikpXG4gICAgLnJlZHVjZSgoc3VtLCBpdGVtKSA9PiBzdW0gKyBpdGVtLmFtb3VudCwgMCk7XG4gIGNvbnN0IHRvdGFsTW9udGhseVNwZW50Q29tYmluZWQgPSBtb250aGx5VG90YWxDb21taXR0ZWQgKyB0aGlzTW9udGhEYWlseVNwZW50O1xuXG4gIC8vIERhaWx5IHNwZW50IGNhbGN1bGF0aW9uXG4gIGNvbnN0IHRvZGF5RGFpbHlTcGVudCA9IGRhaWx5RXhwZW5zZXNcbiAgICAuZmlsdGVyKChlKSA9PiBlLmRhdGUgPT09IHRvZGF5U3RyKVxuICAgIC5yZWR1Y2UoKHN1bSwgaXRlbSkgPT4gc3VtICsgaXRlbS5hbW91bnQsIDApO1xuXG4gIC8vIFRhYiBuYXZpZ2F0aW9uIGhhbmRsZXJcbiAgY29uc3QgaGFuZGxlU2VsZWN0UGFnZSA9IChwYWdlOiBBY3RpdmVQYWdlKSA9PiB7XG4gICAgaWYgKHBhZ2UgPT09ICdhZG1pbicgJiYgIWlzQWRtaW4pIHtcbiAgICAgIHNldElzQWRtaW5BdXRoT3Blbih0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2V0QWN0aXZlUGFnZShwYWdlKTtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oeyB0b3A6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLXNsYXRlLTUwIHRleHQtc2xhdGUtOTAwIGZsZXggZmxleC1jb2wgZm9udC1zYW5zIHBiLTE2XCI+XG4gICAgICB7LyogMSkgVG9wIEhlYWRlciAmIENvdmVyIFBob3RvICovfVxuICAgICAgPEhlYWRlclxuICAgICAgICBzZXR0aW5ncz17c2V0dGluZ3N9XG4gICAgICAgIG1vbnRobHlCdWRnZXQ9e21vbnRobHlCdWRnZXR9XG4gICAgICAgIG1vbnRobHlTcGVudD17dG90YWxNb250aGx5U3BlbnRDb21iaW5lZH1cbiAgICAgICAgZGFpbHlCdWRnZXQ9e2RhaWx5QnVkZ2V0fVxuICAgICAgICBkYWlseVNwZW50PXt0b2RheURhaWx5U3BlbnR9XG4gICAgICAgIG9uT3BlbkFkbWluQXV0aD17KCkgPT4ge1xuICAgICAgICAgIGlmIChpc0FkbWluKSB7XG4gICAgICAgICAgICBzZXRBY3RpdmVQYWdlKCdhZG1pbicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRJc0FkbWluQXV0aE9wZW4odHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgICBpc0FkbWluPXtpc0FkbWlufVxuICAgICAgICBpc1VzZXJWaWV3PXtpc1VzZXJWaWV3fVxuICAgICAgLz5cblxuICAgICAgey8qIE1haW4gQ29udGVudCBBcmVhICovfVxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwiZmxleC0xIHctZnVsbFwiPlxuICAgICAgICB7LyogUGFnZSAxOiBEYXNoYm9hcmQgNCBRdWFkcmFudHMgKOC4q+C4meC5ieC4suC4q+C4peC4seC4gSkgKi99XG4gICAgICAgIHthY3RpdmVQYWdlID09PSAnZGFzaGJvYXJkJyAmJiAoXG4gICAgICAgICAgPEZvdXJRdWFkcmFudHNcbiAgICAgICAgICAgIG1vbnRobHlCdWRnZXQ9e21vbnRobHlCdWRnZXR9XG4gICAgICAgICAgICBkYWlseUJ1ZGdldD17ZGFpbHlCdWRnZXR9XG4gICAgICAgICAgICBtb250aGx5RXhwZW5zZXM9e21vbnRobHlFeHBlbnNlc31cbiAgICAgICAgICAgIGRhaWx5RXhwZW5zZXM9e2RhaWx5RXhwZW5zZXN9XG4gICAgICAgICAgICBvbk9wZW5Nb250aGx5QnVkZ2V0TW9kYWw9eygpID0+IHNldElzTW9udGhseUJ1ZGdldE1vZGFsT3Blbih0cnVlKX1cbiAgICAgICAgICAgIG9uT3Blbk1vbnRobHlFeHBlbnNlTW9kYWw9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0RWRpdGluZ01vbnRobHlFeHBlbnNlKG51bGwpO1xuICAgICAgICAgICAgICBzZXRJc01vbnRobHlFeHBlbnNlTW9kYWxPcGVuKHRydWUpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uT3BlbkRhaWx5QnVkZ2V0TW9kYWw9eygpID0+IHNldElzRGFpbHlCdWRnZXRNb2RhbE9wZW4odHJ1ZSl9XG4gICAgICAgICAgICBvbk9wZW5EYWlseUV4cGVuc2VNb2RhbD17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRFZGl0aW5nRGFpbHlFeHBlbnNlKG51bGwpO1xuICAgICAgICAgICAgICBzZXRJc0RhaWx5RXhwZW5zZU1vZGFsT3Blbih0cnVlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogUGFnZSAyOiBNb250aGx5IERldGFpbHMgRXhjZWwgVGFibGUgKOC4q+C4meC5ieC4suC4o+C4suC4ouC4peC4sOC5gOC4reC4teC4ouC4lOC4leC4suC4o+C4suC4h+C4o+C4suC4ouC4iOC5iOC4suC4ouC4o+C4suC4ouC5gOC4lOC4t+C4reC4mSkgKi99XG4gICAgICAgIHthY3RpdmVQYWdlID09PSAnbW9udGhseScgJiYgKFxuICAgICAgICAgIDxNb250aGx5RGV0YWlsc1ZpZXdcbiAgICAgICAgICAgIGV4cGVuc2VzPXttb250aGx5RXhwZW5zZXN9XG4gICAgICAgICAgICBkYWlseUV4cGVuc2VzPXtkYWlseUV4cGVuc2VzfVxuICAgICAgICAgICAgb25CYWNrPXsoKSA9PiBzZXRBY3RpdmVQYWdlKCdkYXNoYm9hcmQnKX1cbiAgICAgICAgICAgIG9uT3BlbkFkZE1vZGFsPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEVkaXRpbmdNb250aGx5RXhwZW5zZShudWxsKTtcbiAgICAgICAgICAgICAgc2V0SXNNb250aGx5RXhwZW5zZU1vZGFsT3Blbih0cnVlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkVkaXRFeHBlbnNlPXsoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBzZXRFZGl0aW5nTW9udGhseUV4cGVuc2UoaXRlbSk7XG4gICAgICAgICAgICAgIHNldElzTW9udGhseUV4cGVuc2VNb2RhbE9wZW4odHJ1ZSk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25EZWxldGVFeHBlbnNlPXtoYW5kbGVEZWxldGVNb250aGx5RXhwZW5zZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlU3RhdHVzPXtoYW5kbGVUb2dnbGVNb250aGx5U3RhdHVzfVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIFBhZ2UgMzogRGFpbHkgRGV0YWlscyBUYWJsZSAo4Lir4LiZ4LmJ4Liy4Lij4Liy4Lii4Lil4Liw4LmA4Lit4Li14Lii4LiU4LiV4Liy4Lij4Liy4LiH4Lij4Liy4Lii4LiI4LmI4Liy4Lii4Lij4Liy4Lii4Lin4Lix4LiZKSAqL31cbiAgICAgICAge2FjdGl2ZVBhZ2UgPT09ICdkYWlseScgJiYgKFxuICAgICAgICAgIDxEYWlseURldGFpbHNWaWV3XG4gICAgICAgICAgICBleHBlbnNlcz17ZGFpbHlFeHBlbnNlc31cbiAgICAgICAgICAgIG9uQmFjaz17KCkgPT4gc2V0QWN0aXZlUGFnZSgnZGFzaGJvYXJkJyl9XG4gICAgICAgICAgICBvbk9wZW5BZGRNb2RhbD17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRFZGl0aW5nRGFpbHlFeHBlbnNlKG51bGwpO1xuICAgICAgICAgICAgICBzZXRJc0RhaWx5RXhwZW5zZU1vZGFsT3Blbih0cnVlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkVkaXRFeHBlbnNlPXsoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBzZXRFZGl0aW5nRGFpbHlFeHBlbnNlKGl0ZW0pO1xuICAgICAgICAgICAgICBzZXRJc0RhaWx5RXhwZW5zZU1vZGFsT3Blbih0cnVlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkRlbGV0ZUV4cGVuc2U9e2hhbmRsZURlbGV0ZURhaWx5RXhwZW5zZX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuXG4gICAgICAgIHsvKiBQYWdlIDQ6IEFkbWluIFNldHRpbmdzICjguJXguLHguYnguIfguITguYjguLLguYHguK3guJTguKHguLTguJkpICovfVxuICAgICAgICB7YWN0aXZlUGFnZSA9PT0gJ2FkbWluJyAmJiAoXG4gICAgICAgICAgPEFkbWluVmlld1xuICAgICAgICAgICAgc2V0dGluZ3M9e3NldHRpbmdzfVxuICAgICAgICAgICAgdXNlckxpbmtzPXt1c2VyTGlua3N9XG4gICAgICAgICAgICBvbkJhY2s9eygpID0+IHNldEFjdGl2ZVBhZ2UoJ2Rhc2hib2FyZCcpfVxuICAgICAgICAgICAgb25TYXZlU2V0dGluZ3M9e2hhbmRsZVNhdmVTZXR0aW5nc31cbiAgICAgICAgICAgIG9uU2F2ZVVzZXJMaW5rcz17aGFuZGxlU2F2ZVVzZXJMaW5rc31cbiAgICAgICAgICAgIG9uVGVzdEV4cGlyZWRNb2RhbD17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRJc1Rlc3RFeHBpcmVkTW9kYWwodHJ1ZSk7XG4gICAgICAgICAgICAgIHNldElzRXhwaXJlZE1vZGFsT3Blbih0cnVlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkxvZ291dEFkbWluPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldElzQWRtaW4oZmFsc2UpO1xuICAgICAgICAgICAgICBzZXRBY3RpdmVQYWdlKCdkYXNoYm9hcmQnKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgIDwvbWFpbj5cblxuICAgICAgey8qIEJvdHRvbSBOYXZpZ2F0aW9uIFRhYiBCYXIgZm9yIG1vYmlsZSB0aHVtYiBjb250cm9sICovfVxuICAgICAgPE5hdmlnYXRpb25UYWJCYXJcbiAgICAgICAgYWN0aXZlUGFnZT17YWN0aXZlUGFnZX1cbiAgICAgICAgb25TZWxlY3RQYWdlPXtoYW5kbGVTZWxlY3RQYWdlfVxuICAgICAgICBpc0FkbWluPXtpc0FkbWlufVxuICAgICAgICBpc1VzZXJWaWV3PXtpc1VzZXJWaWV3fVxuICAgICAgICBtb250aGx5Q291bnQ9e21vbnRobHlFeHBlbnNlcy5sZW5ndGh9XG4gICAgICAgIGRhaWx5Q291bnQ9e2RhaWx5RXhwZW5zZXMubGVuZ3RofVxuICAgICAgLz5cblxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgTU9EQUxTXG4gICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi99XG4gICAgICB7LyogMS4xLjEpIE1vbnRobHkgQnVkZ2V0IE1vZGFsICovfVxuICAgICAgPE1vbnRobHlCdWRnZXRNb2RhbFxuICAgICAgICBpc09wZW49e2lzTW9udGhseUJ1ZGdldE1vZGFsT3Blbn1cbiAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0SXNNb250aGx5QnVkZ2V0TW9kYWxPcGVuKGZhbHNlKX1cbiAgICAgICAgY3VycmVudEJ1ZGdldD17bW9udGhseUJ1ZGdldH1cbiAgICAgICAgb25TYXZlPXtoYW5kbGVTYXZlTW9udGhseUJ1ZGdldH1cbiAgICAgIC8+XG5cbiAgICAgIHsvKiAxLjIuMSkgTW9udGhseSBFeHBlbnNlIC8gSW5zdGFsbG1lbnQgTW9kYWwgKi99XG4gICAgICA8TW9udGhseUV4cGVuc2VNb2RhbFxuICAgICAgICBpc09wZW49e2lzTW9udGhseUV4cGVuc2VNb2RhbE9wZW59XG4gICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICBzZXRJc01vbnRobHlFeHBlbnNlTW9kYWxPcGVuKGZhbHNlKTtcbiAgICAgICAgICBzZXRFZGl0aW5nTW9udGhseUV4cGVuc2UobnVsbCk7XG4gICAgICAgIH19XG4gICAgICAgIG9uU2F2ZT17aGFuZGxlU2F2ZU1vbnRobHlFeHBlbnNlfVxuICAgICAgICBvbkRlbGV0ZT17aGFuZGxlRGVsZXRlTW9udGhseUV4cGVuc2V9XG4gICAgICAgIGluaXRpYWxEYXRhPXtlZGl0aW5nTW9udGhseUV4cGVuc2V9XG4gICAgICAvPlxuXG4gICAgICB7LyogMS4zLjEpIERhaWx5IEJ1ZGdldCBNb2RhbCAqL31cbiAgICAgIDxEYWlseUJ1ZGdldE1vZGFsXG4gICAgICAgIGlzT3Blbj17aXNEYWlseUJ1ZGdldE1vZGFsT3Blbn1cbiAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0SXNEYWlseUJ1ZGdldE1vZGFsT3BlbihmYWxzZSl9XG4gICAgICAgIGN1cnJlbnRCdWRnZXQ9e2RhaWx5QnVkZ2V0fVxuICAgICAgICBvblNhdmU9e2hhbmRsZVNhdmVEYWlseUJ1ZGdldH1cbiAgICAgIC8+XG5cbiAgICAgIHsvKiAxLjQuMSkgRGFpbHkgRXhwZW5zZSBNb2RhbCAqL31cbiAgICAgIDxEYWlseUV4cGVuc2VNb2RhbFxuICAgICAgICBpc09wZW49e2lzRGFpbHlFeHBlbnNlTW9kYWxPcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgc2V0SXNEYWlseUV4cGVuc2VNb2RhbE9wZW4oZmFsc2UpO1xuICAgICAgICAgIHNldEVkaXRpbmdEYWlseUV4cGVuc2UobnVsbCk7XG4gICAgICAgIH19XG4gICAgICAgIG9uU2F2ZT17aGFuZGxlU2F2ZURhaWx5RXhwZW5zZX1cbiAgICAgICAgb25EZWxldGU9e2hhbmRsZURlbGV0ZURhaWx5RXhwZW5zZX1cbiAgICAgICAgaW5pdGlhbERhdGE9e2VkaXRpbmdEYWlseUV4cGVuc2V9XG4gICAgICAvPlxuXG4gICAgICB7LyogQWRtaW4gQXV0aCBNb2RhbCAoUGFzc3dvcmQgMDk5LTIyNS02NjAxIG1hc2tlZCkgKi99XG4gICAgICA8QWRtaW5BdXRoTW9kYWxcbiAgICAgICAgaXNPcGVuPXtpc0FkbWluQXV0aE9wZW59XG4gICAgICAgIG9uQ2xvc2U9eygpID0+IHNldElzQWRtaW5BdXRoT3BlbihmYWxzZSl9XG4gICAgICAgIG9uU3VjY2Vzcz17KCkgPT4ge1xuICAgICAgICAgIHNldElzQWRtaW4odHJ1ZSk7XG4gICAgICAgICAgc2V0SXNBZG1pbkF1dGhPcGVuKGZhbHNlKTtcbiAgICAgICAgICBzZXRBY3RpdmVQYWdlKCdhZG1pbicpO1xuICAgICAgICB9fVxuICAgICAgLz5cblxuICAgICAgey8qIEV4cGlyZWQgVXNlciBBbGVydCBNb2RhbCAqL31cbiAgICAgIDxFeHBpcmVkVXNlck1vZGFsXG4gICAgICAgIGlzT3Blbj17aXNFeHBpcmVkTW9kYWxPcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgc2V0SXNFeHBpcmVkTW9kYWxPcGVuKGZhbHNlKTtcbiAgICAgICAgICBzZXRJc1Rlc3RFeHBpcmVkTW9kYWwoZmFsc2UpO1xuICAgICAgICB9fVxuICAgICAgICBhZG1pblBob25lPXtzZXR0aW5ncy5hZG1pblBob25lIHx8ICcwOTktMjI1LTY2MDEnfVxuICAgICAgICBhZG1pbk5hbWU9e3NldHRpbmdzLmFkbWluTmFtZSB8fCAn4LiK4LmI4Liy4LiH4Lir4LiZ4LmI4Lit4Lii4LiK4Li44Lih4LmB4LieJ31cbiAgICAgICAgdXNlck5hbWU9e2V4cGlyZWRVc2VyTmFtZX1cbiAgICAgICAgaXNUZXN0TW9kZT17aXNUZXN0RXhwaXJlZE1vZGFsfVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdfQ==