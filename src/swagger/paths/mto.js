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
 * /mto/download/{projectId}:
 *   get:
 *     summary: Download MTO data as CSV
 *     description: Exports all MTO entries from the specified project's collection as a CSV file.
 *     tags:
 *       - MTO
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: The ID of the project to fetch the MTO data from.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Project not found or no MTO data found
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
 * /mto/summery/{projectId}:
 *   get:
 *     summary: Retrieve headers and MTO data for a specific project
 *     description: Fetch the headers and MTO data associated with a project by its ID. Optionally, users can select specific headers to filter the MTO data. Data is paginated with optional query parameters for page number and limit. If the `download` query parameter is provided, the MTO data is returned as a downloadable CSV file.
 *     tags:
 *       - MTO
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *       - in: query
 *         name: selectedHeaders
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           description: An array or comma-separated list of headers to filter the MTO data
 *       - in: query
 *         name: download
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - "true"
 *           description: Set to 'true' to download the MTO data as a CSV file
 *     responses:
 *       200:
 *         description: Successfully retrieved headers and MTO data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 headers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of all headers in snake_case
 *                 selectedHeaders:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of selected headers used to filter MTO data
 *                 mtoData:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Array of MTO data entries filtered by selected headers
 *                 projectName:
 *                   type: string
 *                   description: Name of the project
 *                 totalCount:
 *                   type: integer
 *                   description: Total count of MTO entries matching the selected headers
 *       400:
 *         description: Project ID is required or invalid headers are selected
 *       404:
 *         description: Project not found, no headers available, or no MTO data for the selected headers
 *       500:
 *         description: Internal Server Error
 */
