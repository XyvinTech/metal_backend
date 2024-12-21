/**
 * @swagger
 * tags:
 *   - name: MTO
 *     description: MTO related endpoints
 */

/**
 * @swagger
 * /mto:
 *   post:
 *     summary: Create a new MTO entry
 *     description: Creates a new MTO entry with the provided details.
 *     tags:
 *       - MTO
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unit:
 *                 type: string
 *                 example: "Unit A"
 *               lineNo:
 *                 type: string
 *                 example: "LN001"
 *               lineLocation:
 *                 type: string
 *                 example: "Location A"
 *               areaLineSheetIdent:
 *                 type: string
 *                 example: "ALS001"
 *               area:
 *                 type: string
 *                 example: "Area A"
 *               line:
 *                 type: string
 *                 example: "Line A"
 *               sheet:
 *                 type: number
 *                 example: 1
 *               identCode:
 *                 type: string
 *                 example: "IC001"
 *               uom:
 *                 type: string
 *                 example: "KG"
 *               size:
 *                 type: number
 *                 example: 100
 *               sizeTwo:
 *                 type: number
 *                 example: 150
 *               specCode:
 *                 type: string
 *                 example: "SPEC001"
 *               shortCode:
 *                 type: string
 *                 example: "SC001"
 *               cat:
 *                 type: string
 *                 example: "Category A"
 *               shortDesc:
 *                 type: string
 *                 example: "Short description of MTO"
 *               mtoRev:
 *                 type: string
 *                 example: "Rev A"
 *               sf:
 *                 type: string
 *                 example: "SF001"
 *               scopeQty:
 *                 type: number
 *                 example: 500
 *               issuedQtyAss:
 *                 type: number
 *                 example: 300
 *               issuedDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-18"
 *               balToIssue:
 *                 type: number
 *                 example: 200
 *               consumedQty:
 *                 type: number
 *                 example: 100
 *               balanceStock:
 *                 type: number
 *                 example: 150
 *     responses:
 *       201:
 *         description: MTO entry created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /mto/list:
 *   get:
 *     summary: Get all MTO entries
 *     description: Retrieves a list of all MTO entries.
 *     tags:
 *       - MTO
 *     responses:
 *       200:
 *         description: MTO entries retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /mto/single/{id}:
 *   get:
 *     summary: Get an MTO entry by ID
 *     description: Retrieves an MTO entry by its ID.
 *     tags:
 *       - MTO
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the MTO entry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: MTO entry retrieved successfully
 *       404:
 *         description: MTO entry not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /mto/single/{id}:
 *   put:
 *     summary: Update an MTO entry
 *     description: Updates an MTO entry with the provided details.
 *     tags:
 *       - MTO
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the MTO entry to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issuedQtyAss:
 *                 type: number
 *                 example: 350
 *               issuedDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-19"
 *               consumedQty:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: MTO entry updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: MTO entry not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /mto/single/{id}:
 *   delete:
 *     summary: Delete an MTO entry
 *     description: Deletes an MTO entry by its ID.
 *     tags:
 *       - MTO
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the MTO entry to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: MTO entry deleted successfully
 *       404:
 *         description: MTO entry not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /mto/download:
 *   get:
 *     summary: Download MTO data as CSV
 *     description: Exports all MTO entries as a CSV file. 
 *     tags:
 *       - MTO
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully
 *       404:
 *         description: No MTO data found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /mto/summery:
 *   get:
 *     summary: Download summer data as excel
 *     description: Exports all MTO entries as a CSV file. 
 *     tags:
 *       - MTO
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully
 *       404:
 *         description: No MTO data found
 *       500:
 *         description: Internal Server Error
 */
