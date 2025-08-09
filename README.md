# Upliance — Dynamic Form Builder

A dynamic form builder built with React + TypeScript + MUI + Redux.  
Features: add fields, validations, derived fields (formulas), preview, and save forms to localStorage.

## ✨ Features

- Add fields: **Text**, **Number**, **Textarea**, **Select**, **Radio**, **Checkbox**, **Date**
- Configure:
  - Labels
  - Default values
  - Validation rules:
    - Required
    - Min/Max length
    - Email format
    - Password rule (≥8 chars + number)
- Create **derived fields** using formulas based on other fields
- Reorder and delete fields
- Preview form with live validation & derived field updates
- Save forms to localStorage
- View, load, and delete saved forms

## Run locally
1. `npm install`
2. `npm run dev`
3. Open http://localhost:5173

## Build
`npm run build`

## Notes
- Derived formulas use `{{fieldId}}` placeholders.
- Saved forms are stored in localStorage under key `upl_forms_v1`.

## 📍 Pages Overview
`/create`
Form builder page:

- Add & edit fields
- Configure validations
- Set up derived fields
- Save form schema

`/preview`
Preview the current form draft:

- Fill fields and test validations
- Live update for derived fields

`/myforms`
View all saved forms:

- Load into preview
- Delete saved forms

## Creating Derived Field Formulas
Derived fields calculate their value based on parent fields.

1. Create parent fields

Example:
- Price (number)
- Quantity (number)

2. Create the derived field

- In /create, add a new field (type: number or text).
- Toggle Derived field = ON.
- Select the Parent fields (Price, Quantity).
- Write your formula using placeholders: `Number({{<quantityId>}}) * Number({{<priceId>}})`

# 🔍 Finding the Correct ID for Formulas
You must use the internal field IDs in formulas — not the label text.

Step-by-step method (Local Storage inspection)

1. In /create, finish adding your fields (e.g., Price, Quantity, Total).

2. Click Save Form, give it a name, and click Save.

3. Open your browser’s DevTools:

4. Chrome: Press F12 → go to Application tab.

5. Firefox: Press F12 → go to Storage tab.

6. In the Local Storage section, click your app’s domain (e.g., http://localhost:5173).

7. Look for a key like: `upl_forms_v1`

8. Expand its value — it’s JSON with your saved forms.

9. Inside the "fields" array, find your parent fields: `"id": "quantity-uuid-123",`

10. Copy these id values.

11. Use them in your formula placeholders: `Number({{quantity-uuid-456}}) * Number({{price-uuid-123}})`

## 🧪 Testing Derived Fields
- Go to `/preview`.
- Change Price and Quantity values.
- The Total (derived field) should update immediately.
- If it doesn’t:
- Double-check that IDs in the formula match the IDs in localStorage.
- Wrap numeric placeholders in Number(...) to avoid string concatenation.
- Check the browser console for formula evaluation errors.
