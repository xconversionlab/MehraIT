//#region node_modules/.nitro/vite/services/ssr/assets/pricing-DaB8c9_f.js
function inr(paise) {
	const value = paise / 100;
	const whole = Math.round(value * 100) % 100 === 0;
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: whole ? 0 : 2,
		minimumFractionDigits: whole ? 0 : 2
	}).format(value);
}
function discountPercent(mrp, price) {
	if (mrp <= price || mrp <= 0) return 0;
	return Math.round((mrp - price) / mrp * 100);
}
function quoteCart(input) {
	const lines = input.lines.map((line) => {
		const linePaise = line.pricePaise * line.qty;
		const taxPaise = Math.round(linePaise * line.taxBps / (1e4 + line.taxBps));
		return {
			...line,
			linePaise,
			taxPaise
		};
	});
	const subtotalPaise = lines.reduce((s, l) => s + l.linePaise, 0);
	const mrpPaise = lines.reduce((s, l) => s + l.mrpPaise * l.qty, 0);
	const taxPaise = lines.reduce((s, l) => s + l.taxPaise, 0);
	let discountPaise = 0;
	let couponError = null;
	let couponCode = null;
	const coupon = input.coupon;
	if (coupon) {
		couponCode = coupon.code;
		if (input.couponAlreadyUsed) couponError = "You have already used this coupon.";
		else if (subtotalPaise < coupon.minSubtotalPaise) couponError = `Add ${inr(coupon.minSubtotalPaise - subtotalPaise)} more to use ${coupon.code}.`;
		else if (coupon.kind === "flat") discountPaise = Math.min(coupon.amount, subtotalPaise);
		else {
			const raw = Math.round(subtotalPaise * coupon.amount / 100);
			discountPaise = Math.min(raw, coupon.maxDiscountPaise || raw, subtotalPaise);
		}
		if (couponError) {
			discountPaise = 0;
			couponCode = null;
		}
	}
	const after = subtotalPaise - discountPaise;
	const deliveryPaise = after <= 0 || after >= input.freeAbovePaise ? 0 : input.deliveryFeePaise;
	return {
		lines,
		subtotalPaise,
		mrpPaise,
		discountPaise,
		deliveryPaise,
		taxPaise,
		payablePaise: after + deliveryPaise,
		couponError,
		couponCode
	};
}
//#endregion
export { inr as n, quoteCart as r, discountPercent as t };
