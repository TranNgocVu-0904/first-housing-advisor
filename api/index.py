from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInput(BaseModel):
    income: float
    capital: float
    price: float
    rent: float
    q1: int
    q2: int
    q3: int
    q4: int
    q5: int
    q6: int
    q7: int
    q8: int
    q9: int
    q10: int

@app.post("/api/analyze")
def analyze_finances(data: UserInput):
    # 1. Psychological Scoring
    yolo_score = (data.q1 + data.q2 + data.q3 + data.q4 + data.q5) / 5
    safety_score = (data.q6 + data.q7) / 2
    rational_score = (data.q8 + data.q9 + data.q10) / 3

    # 2. Archetype Determination
    capital_ratio = data.capital / data.price if data.price > 0 else 0
    
    if yolo_score >= 3.5 and capital_ratio < 0.3:
        archetype = "🦅 Free Eagle"
        advice = "You value experiences and currently lack the capital for a safe down payment. High risk of emotional overspending. Advise: Rent for now, enjoy your flexibility, but automate your savings!"
    elif yolo_score >= 3.5 and capital_ratio >= 0.3:
        archetype = "🐅 Nomad Tiger"
        advice = "You have the capital but your spending habits lean towards high-action and trends. Advise: Rent and invest aggressively in high-yield assets, or buy property specifically to flip."
    elif yolo_score < 3.5 and capital_ratio >= 0.3:
        archetype = "🏰 Settled Lord"
        advice = "You are financially and mentally prepared for homeownership! Your grounded habits and solid capital make buying a house a safe, wealth-building move."
    else:
        archetype = "🐢 Accumulating Turtle"
        advice = "You have great saving habits but need more capital to safely buy. Advise: Rent temporarily while you grow your savings to hit that 30% safe threshold."

    # 3. Financial Projections (10 Years)
    buy_data = []
    rent_data = []

    # Initial states
    house_value = data.price
    loan_amount = max(0, data.price - data.capital)
    yearly_principal_payment = loan_amount / 20 if loan_amount > 0 else 0
    
    current_rent_monthly = data.rent
    accumulated_investment = data.capital

    for year in range(1, 11):
        # BUY SCENARIO: 5% appreciation. Net Worth = House Value - Remaining Loan
        house_value *= 1.05
        remaining_loan = max(0, loan_amount - (yearly_principal_payment * year))
        net_worth_buy = house_value - remaining_loan
        buy_data.append(round(net_worth_buy, 2))

        # RENT SCENARIO: 8% return, 3% rent inflation. Net Worth = Inv + Initial Cap
        yearly_rent = current_rent_monthly * 12
        yearly_surplus = max(0, (data.income * 12) - yearly_rent)
        
        accumulated_investment = (accumulated_investment * 1.08) + yearly_surplus
        current_rent_monthly *= 1.03 # Rent inflation
        rent_data.append(round(accumulated_investment, 2))

    return {
        "yolo_score": round(yolo_score, 1),
        "safety_score": round(safety_score, 1),
        "rational_score": round(rational_score, 1),
        "archetype": archetype,
        "advice": advice,
        "buy_data": buy_data,
        "rent_data": rent_data
    }