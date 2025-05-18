document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const pdfGrid = document.getElementById('pdfGrid');
    const paginationContainer = document.getElementById('pagination');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('pdfSearchInput');
    const searchButton = document.getElementById('searchBtn');
    const noResultsMessage = document.getElementById('noResults');
    let pdfToDownloadPath = ''; // To store the path of the PDF to download
    let pdfToDownloadTitle = ''; // To store the title for the download attribute
    
    // Initialize PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
        console.log('PDF.js worker initialized');
    } else {
        console.error('PDF.js library not loaded! PDF previews may not work.');
    }
    
    // Pagination settings
    const itemsPerPage = 12;
    let currentPage = 1;
    let filteredPdfs = [];
    
    // Initialize with all PDFs
    filteredPdfs = pdfData || []; // Use pdfData from pdf-data.js, fallback to empty array if not available
    
    // Initial render
    renderPdfs();
    
    // Category filter event listeners
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected category
            const category = this.getAttribute('data-category');
            
            // Filter PDFs by category
            if (category === 'all') {
                filteredPdfs = [...pdfData]; // Create a copy of pdfData
            } else {
                filteredPdfs = pdfData.filter(pdf => {
                    return pdf.category && pdf.category.toLowerCase() === category.toLowerCase();
                });
            }
            
            // Reset to first page and render
            currentPage = 1;
            renderPdfs();
        });
    });
    
    // Search functionality
    const handleSearch = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // If search is empty, restore the current category filter
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            if (activeCategory === 'all') {
                filteredPdfs = pdfData; // Use pdfData
            } else {
                filteredPdfs = pdfData.filter(pdf => pdf.category === activeCategory); // Use pdfData
            }
        } else {
            // Filter by search term within the current category filter
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            const categoryFiltered = activeCategory === 'all' ? pdfData : pdfData.filter(pdf => pdf.category === activeCategory); // Use pdfData
            
            filteredPdfs = categoryFiltered.filter(pdf => {
                return (pdf.title && pdf.title.toLowerCase().includes(searchTerm)) || 
                       (pdf.description && pdf.description.toLowerCase().includes(searchTerm));
            });
        }
        
        // Reset to first page and render
        currentPage = 1;
        renderPdfs();
    };
    
    // Search button click event
    searchButton.addEventListener('click', handleSearch);
    
    // Search input enter key event
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Render PDFs with pagination


function renderPdfs() {
        // Clear the grid
        pdfGrid.innerHTML = '';
        
        // Show/hide no results message
        if (filteredPdfs.length === 0) {
            noResultsMessage.style.display = 'block';
            paginationContainer.innerHTML = '';
            return;
        } else {
            noResultsMessage.style.display = 'none';
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredPdfs.length);
        
        // Get current page items
        const currentItems = filteredPdfs.slice(startIndex, endIndex);
        
        // Create PDF cards
        currentItems.forEach(pdf => {
            const pdfCard = document.createElement('div');
            pdfCard.className = 'pdf-card';
            
            // Ensure PDF path is valid
            const pdfPath = pdf.path || '';
            const pdfTitle = pdf.title || 'Untitled PDF';
            const pdfDescription = pdf.description || 'No description available';
            const pdfId = pdf.id || `pdf-${Math.random().toString(36).substr(2, 9)}`;
            
            pdfCard.innerHTML = `
                <div class="pdf-info">
                    <h3>${pdfTitle}</h3>
                    <!-- <p>${pdfDescription}</p> --> <!-- Description removed as per request -->
                    <div class="pdf-actions">
                        <a href="#" class="preview-btn" data-pdf="${pdfPath}"><i class="fas fa-eye"></i> Preview</a>
                        <a href="#" class="download-btn" data-pdf-path="${pdfPath}" data-pdf-title="${pdfTitle}"><i class="fas fa-download"></i> Download</a>
                    </div>
                </div>
            `;
            
            pdfGrid.appendChild(pdfCard);
        });
        
        // Update pagination
        renderPagination(totalPages);
        
        // Reinitialize preview functionality for new buttons
        initializePreviewButtons();
        initializeDownloadButtons(); // Initialize download buttons with password logic
    }
    
    // Render pagination controls
    function renderPagination(totalPages) {
        paginationContainer.innerHTML = '';
        
        // Don't show pagination if only one page
        if (totalPages <= 1) return;
        
        // Previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevButton.addEventListener('click', () => {
                currentPage--;
                renderPdfs();
                // Scroll to top of grid
                pdfGrid.scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(prevButton);
        }
        
        // Page number buttons
        const createPageButton = (pageNum) => {
            const pageButton = document.createElement('button');
            pageButton.textContent = pageNum;
            if (pageNum === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = pageNum;
                renderPdfs();
                // Scroll to top of grid
                pdfGrid.scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageButton);
        };
        
        // Determine which page buttons to show
        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                createPageButton(i);
            }
        } else {
            // Show first page
            createPageButton(1);
            
            // Show ellipsis or pages around current page
            if (currentPage <= 3) {
                // Near the start
                for (let i = 2; i <= 5; i++) {
                    createPageButton(i);
                }
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsis);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsis);
                for (let i = totalPages - 4; i < totalPages; i++) {
                    createPageButton(i);
                }
            } else {
                // Middle
                const ellipsisBefore = document.createElement('span');
                ellipsisBefore.textContent = '...';
                ellipsisBefore.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsisBefore);
                
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    createPageButton(i);
                }
                
                const ellipsisAfter = document.createElement('span');
                ellipsisAfter.textContent = '...';
                ellipsisAfter.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsisAfter);
            }
            
            // Show last page
            createPageButton(totalPages);
        }
        
        // Next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextButton.addEventListener('click', () => {
                currentPage++;
                renderPdfs();
                // Scroll to top of grid
                pdfGrid.scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(nextButton);
        }
    }
    
    // Initialize preview functionality
    function initializePreviewButtons() {
        const modal = document.getElementById('pdfModal');
        const pdfViewer = document.getElementById('pdfViewer');
        const closeBtn = document.querySelector('.pdf-close');
        const previewBtns = document.querySelectorAll('.preview-btn');
        
        if (!modal || !pdfViewer || !closeBtn) {
            console.error('PDF preview modal elements not found!');
            return;
        }
        
        // Add click event to all preview buttons
        previewBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const pdfPath = this.getAttribute('data-pdf');
                
                if (!pdfPath) {
                    console.error('No PDF path specified for preview');
                    return;
                }
                
                // Show loading indicator or message if needed
                // pdfViewer.insertAdjacentHTML('beforebegin', '<div class="pdf-loading">Loading PDF...</div>');
                
                // Set iframe source to PDF path
                pdfViewer.src = pdfPath;
                
                // Add load event to handle errors
                pdfViewer.onload = function() {
                    // Remove loading indicator if implemented
                    // const loadingEl = modal.querySelector('.pdf-loading');
                    // if (loadingEl) loadingEl.remove();
                };
                
                pdfViewer.onerror = function() {
                    console.error(`Error loading PDF for preview: ${pdfPath}`);
                    // Could show error message in modal
                };
                
                // Display the modal
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            });
        });
        
        // Close the modal when clicking the close button
        closeBtn.addEventListener('click', function() {
            closeModal();
        });
        
        // Close the modal when clicking outside of it
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close modal function
        function closeModal() {
            modal.style.display = 'none';
            pdfViewer.src = ''; // Clear the iframe source
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }

    // Initialize download buttons with password protection
    function initializeDownloadButtons() {
        const downloadBtns = document.querySelectorAll('.download-btn');
        
        if (!passwordModal || !passwordInput || !passwordError) {
            console.warn("Password modal elements not found. Setting up direct downloads instead.");
        }
        
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default link behavior
                const pdfPath = this.getAttribute('data-pdf-path');
                const pdfTitle = this.getAttribute('data-pdf-title');
                
                if (!pdfPath) {
                    console.error("Download button clicked but no PDF path specified");
                    return;
                }
                console.log(`Download button clicked for: ${pdfPath}`);

                try {
                    // Create a temporary link and click it to trigger download
                    const link = document.createElement('a');
                    // Use the current URL path to create an absolute path to the PDF
                    const absolutePdfPath = new URL(pdfPath, window.location.href).href;
                    link.href = absolutePdfPath;
                    link.download = pdfTitle || pdfPath.substring(pdfPath.lastIndexOf('/') + 1) || 'download.pdf';
                    // Set target to _blank to ensure download works in all browsers
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log(`Download initiated for: ${absolutePdfPath}`);
                } catch (error) {
                    console.error(`Error downloading PDF: ${error.message}`);
                    alert('Error downloading the PDF. Please try again.');
                }
            });
        });
    }
    
    // Helper function to handle the actual download
    function downloadPdf(pdfPath, pdfTitle) {
        if (!pdfPath) {
            console.error("Cannot download: No PDF path provided");
            return;
        }
        
        try {
            const link = document.createElement('a');
            link.href = pdfPath;
            link.download = pdfTitle || pdfPath.substring(pdfPath.lastIndexOf('/') + 1) || 'download.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`Download initiated for: ${pdfPath}`);
        } catch (error) {
            console.error(`Error downloading PDF: ${error.message}`);
        }
    }


});