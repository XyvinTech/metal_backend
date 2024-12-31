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
 *     description: Retrieves a list of all MTO entries for a specific project dynamically based on its collection name.
 *     tags:
 *       - MTO
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to fetch MTO entries for.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of entries to retrieve per page.
 *     responses:
 *       200:
 *         description: MTO entries retrieved successfully
 *       400:
 *         description: Invalid input or missing parameters
 *       404:
 *         description: Project or collection not found
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
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Page number for pagination.
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
 * /mto/summery/{id}:
 *   get:
 *     summary: Fetch MTO summary by project ID
 *     description: Retrieves a paginated summary of MTO entries for a specified project, including relevant details such as identCode, size, UOM, and more.
 *     tags:
 *       - MTO
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to fetch the MTO summary for.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of entries to retrieve per page.
 *     responses:
 *       200:
 *         description: MTO entry retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "MTO entry retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       identCode:
 *                         type: string
 *                         example: "IC-12345"
 *                       uom:
 *                         type: string
 *                         example: "kg"
 *                       size:
 *                         type: string
 *                         example: "12"
 *                       sizeTwo:
 *                         type: string
 *                         example: "24"
 *                       cat:
 *                         type: string
 *                         example: "Category A"
 *                       shortDesc:
 *                         type: string
 *                         example: "Short description of the item"
 *                       scopeQty:
 *                         type: number
 *                         example: 100
 *                       issuedQtyAss:
 *                         type: number
 *                         example: 50
 *                       issuedDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-23T00:00:00Z"
 *                       consumedQty:
 *                         type: number
 *                         example: 30
 *                       balanceStock:
 *                         type: number
 *                         example: 20
 *       404:
 *         description: MTO entry not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "MTO entry not found"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: [error details]"
 */




/**
 * @swagger
 * /mto/summery/download/{id}:
 *   get:
 *     summary: Download MTO summary as a CSV file
 *     description: Retrieves MTO data for a specified project ID and downloads it as a CSV file.
 *     tags:
 *       - MTO
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to fetch and download the MTO summary for.
 *     responses:
 *       200:
 *         description: MTO summary downloaded successfully as a CSV file.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: |
 *                 identCode,uom,size,sizeTwo,cat,shortDesc,scopeQty,issuedQtyAss,issuedDate,consumedQty,balanceStock
 *                 IC-12345,kg,12,24,Category A,Short description of the item,100,50,2024-12-23T00:00:00Z,30,20
 *       404:
 *         description: No MTO data found for the specified project.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No MTO data found for this project"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: [error details]"
 */


/**
 * @swagger
 * /mto/update:
 *   put:
 *     summary: Upload an Excel file
 *     description: Uploads an Excel file, associates its content with a project ID, and saves the data to the database.
 *     tags:
 *       - MTO
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The Excel file to be uploaded.
 *               project:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the project to associate the data with.
 *             required:
 *               - file
 *               - project
 *     responses:
 *       201:
 *         description: Excel file uploaded and data saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Excel file uploaded and data saved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         format: uuid
 *                       project:
 *                         type: string
 *                         format: uuid
 *                       unit:
 *                         type: string
 *                       lineNo:
 *                         type: string
 *                       lineLocation:
 *                         type: string
 *                       areaLineSheetIdent:
 *                         type: string
 *                       area:
 *                         type: string
 *                       line:
 *                         type: string
 *                       sheet:
 *                         type: number
 *                       identCode:
 *                         type: string
 *                       uom:
 *                         type: string
 *                       size:
 *                         type: number
 *                       sizeTwo:
 *                         type: number
 *                       specCode:
 *                         type: string
 *                       shortCode:
 *                         type: string
 *                       cat:
 *                         type: string
 *                       shortDesc:
 *                         type: string
 *                       mtoRev:
 *                         type: string
 *                       sf:
 *                         type: string
 *                       scopeQty:
 *                         type: number
 *                       issuedQtyAss:
 *                         type: number
 *                       issuedDate:
 *                         type: string
 *                         format: date-time
 *                       balToIssue:
 *                         type: number
 *                       consumedQty:
 *                         type: number
 *                       balanceStock:
 *                         type: number
 *       400:
 *         description: No file uploaded, project ID missing, or file contains insufficient data.
 *       500:
 *         description: Internal Server Error.
 */
