package com.anantarealty.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.jfree.util.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;

import com.anantarealty.model.Lead;
import com.anantarealty.model.LeadHistory;
import com.anantarealty.model.LeadImportHistory;
import com.anantarealty.model.Profile;
import com.anantarealty.model.SourceInfo;
import com.anantarealty.model.User;
import com.anantarealty.model.WonInfo;
import com.anantarealty.repository.ImportHistoryRepository;
import com.anantarealty.repository.LeadHistoryRepository;
import com.anantarealty.repository.LeadRepository;
import com.anantarealty.repository.SourceInfoRepository;
import com.anantarealty.repository.UserRepository;
import com.anantarealty.repository.WonInfoRepository;
import com.anantarealty.service.UserDetailsServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class LeadService {
	@Autowired
	private UserDetailsServiceImpl detailsServiceImpl;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private LeadRepository leadRepository;

	@Autowired
	private SourceInfoRepository sourceInfoRepository;

	@Autowired
	private WonInfoRepository wonInfoRepository;

	@Autowired
	private LeadHistoryRepository leadHistoryRepository;

	@Autowired
	private ImportHistoryRepository importHistoryRepository;

	public List<Lead> getAllLeads() {
		
		return leadRepository.findAll();
		
		/*// return the current login User email(user name)
		String loginUserEmailId = detailsServiceImpl.getLoginUser();

		if (loginUserEmailId == null) {
			throw new RuntimeException("User not authenticated");
		}
		// fetching data
		User logInUser = userRepository.findByemail(loginUserEmailId);
		List<String> usernames = userRepository.findUserNameByManagerName(loginUserEmailId);

	
		if (logInUser.getProfile().equals(Profile.ADMIN)) {
			return leadRepository.findAll();
		} else if (logInUser.getProfile().equals(Profile.MANAGER)) {
			return leadRepository.findByLeadOwnerIn(usernames);
		} else if (logInUser.getProfile().equals(Profile.EMPLOYEE)) {
			String UserName = userRepository.findUsernameByEmail(loginUserEmailId);
			System.out.println(UserName);
			return leadRepository.findByLeadOwner(UserName);
		}
		return null; */
	}

	public List<Lead> getAllLeadsByUser() {
		//String UserName = userRepository.findUsernameByEmail("admin@gmail.com");
		return leadRepository.findByLeadOwner("divya");
		
	/*	// return the current login User email(user name)
		String loginUserEmailId = detailsServiceImpl.getLoginUser();

		if (loginUserEmailId == null) {
			throw new RuntimeException("User not authenticated");
		}
		// fetching data
		String UserName = userRepository.findUsernameByEmail(loginUserEmailId);
		return leadRepository.findByLeadOwner(UserName);
*/
	}

	public void deleteLeads(List<Long> leadIds) {
		// Iterate the loop on each lead Id
		for (Long leadId : leadIds) {
			if (leadId != null) { // Check for null IDs
				try {
					Optional<Lead> lead = leadRepository.findById(leadId);
					System.out.println(lead.get().getSourceInfo().getSourceInfoId());
					System.out.println(leadId);
					leadRepository.deleteById(leadId);
					if (lead.get().getWonInfo().getWonInfoId() != null)
						wonInfoRepository.deleteById(lead.get().getWonInfo().getWonInfoId());
					if (lead.get().getSourceInfo().getSourceInfoId() != null)
						sourceInfoRepository.deleteById(lead.get().getSourceInfo().getSourceInfoId());
					if (lead.get().getLeadHistory().getLeadHistoryId() != null)
						leadHistoryRepository.deleteById(lead.get().getLeadHistory().getLeadHistoryId());

					System.out.println("Deleted lead with ID: " + leadId);
				} catch (Exception e) {
					System.err.println("Error deleting lead with ID: " + leadId + " - " + e.getMessage());
				}
			} else {
				System.out.println("Null lead ID encountered, skipping.");
			}
		}
	}

	public Set<String> getLeadStages() {
		// Assuming LeadStageRepository has a method to fetch stages
		List<Lead> leads = leadRepository.findAll();
		Set<String> leadStages = leads.stream().map(Lead::getLeadStage) // Extract lead stage
				.collect(Collectors.toSet()); // Collect into a Set
		return leadStages;

	}

	// to save new lead
	public void addLead(Lead lead) {
		// leadRepository.save(lead);
		if (lead != null) {
			if (lead.getLeadHistory() != null) {
				lead.getLeadHistory().setLeadCreation(LocalDateTime.now());
				leadRepository.save(lead);
			} else {
				LeadHistory history = new LeadHistory();
				history.setLeadCreation(LocalDateTime.now());
				lead.setLeadHistory(history);
				leadRepository.save(lead);
			}
		}
	}

	// Fetch lead By leadId
	public Lead fetchLead(Long id) {
		try {
			Optional<Lead> dbLead = leadRepository.findById(id);
			if (dbLead.isPresent()) {
				return dbLead.get();
			} else
				return null;
		} catch (Exception e) {
			return null;
		}
	}

	// update lead using lead id
	public Lead updateLead(Long id, Lead leadDetails) {
		Optional<Lead> leadOptional = leadRepository.findById(id);

		if (leadOptional.isEmpty()) {
			return null;
		}

		Lead existingLead = leadOptional.get();

		// Update all fields from leadDetails to existingLead
		existingLead.setContactName(leadDetails.getContactName());
		existingLead.setMobileNumber(leadDetails.getMobileNumber());
		existingLead.setAlternateNumber(leadDetails.getAlternateNumber());
		existingLead.setEmailAddress(leadDetails.getEmailAddress());
		existingLead.setExpectedRevenue(leadDetails.getExpectedRevenue());
		existingLead.setLeadStage(leadDetails.getLeadStage());
		existingLead.setNextFollowUpOn(leadDetails.getNextFollowUpOn());
		existingLead.setNextFollowUpNotes(leadDetails.getNextFollowUpNotes());
		existingLead.setDescription(leadDetails.getDescription());
		existingLead.setLeadOwner(leadDetails.getLeadOwner());
		existingLead.setLeadOwnerEmail(leadDetails.getLeadOwnerEmail());
		existingLead.setCategory(leadDetails.getCategory());
		existingLead.setAssignedManager(leadDetails.getAssignedManager());
		existingLead.setLeadTitle(leadDetails.getLeadTitle());
		existingLead.setExpectedClosingDate(leadDetails.getExpectedClosingDate());

		// Update source info if present
		if (leadDetails.getSourceInfo() != null) {
			if (existingLead.getSourceInfo() == null) {
				existingLead.setSourceInfo(leadDetails.getSourceInfo());
			} else {
				existingLead.getSourceInfo().setLeadSource(leadDetails.getSourceInfo().getLeadSource());
				existingLead.getSourceInfo().setCampaignTeam(leadDetails.getSourceInfo().getCampaignTeam());
				existingLead.getSourceInfo().setCampaignName(leadDetails.getSourceInfo().getCampaignName());
				existingLead.getSourceInfo().setCampaignContent(leadDetails.getSourceInfo().getCampaignContent());
			}
		}
		// update won info if it is present
		if (leadDetails.getWonInfo() != null) {
			if (existingLead.getWonInfo() == null) {
				existingLead.setWonInfo(leadDetails.getWonInfo());
			} else {
				existingLead.getWonInfo().setDealNoOfCents(leadDetails.getWonInfo().getDealNoOfCents());
				existingLead.getWonInfo().setDealDate(leadDetails.getWonInfo().getDealDate());
				existingLead.getWonInfo().setDealTotalValue(leadDetails.getWonInfo().getDealTotalValue());
				existingLead.getWonInfo().setDealDescription(leadDetails.getWonInfo().getDealDescription());
				existingLead.getWonInfo().setDealPrice(leadDetails.getWonInfo().getDealPrice());
			}
		}
		if (leadDetails.getLeadHistory() != null) {
			if (existingLead.getLeadHistory() == null) {
				existingLead.setLeadHistory(leadDetails.getLeadHistory());
			} else {
				existingLead.getLeadHistory().setLeadCreation(leadDetails.getLeadHistory().getLeadCreation());
				existingLead.getLeadHistory().setLastViewed(leadDetails.getLeadHistory().getLastViewed());
				existingLead.getLeadHistory().setModifiedTime(leadDetails.getLeadHistory().getModifiedTime());
			}
		}

		Lead updatedLead = leadRepository.save(existingLead);
		return updatedLead;
	}

	// from view leadform
	public Lead updateLead(Lead lead) {
		Lead existingLead = leadRepository.findById(lead.getLeadId())
				.orElseThrow(() -> new RuntimeException("Lead not found"));

		// Update all fields
		existingLead.setLeadTitle(lead.getLeadTitle());
		existingLead.setContactName(lead.getContactName());
		existingLead.setMobileNumber(lead.getMobileNumber());
		existingLead.setAlternateNumber(lead.getAlternateNumber());
		existingLead.setEmailAddress(lead.getEmailAddress());
		existingLead.setExpectedRevenue(lead.getExpectedRevenue());
		existingLead.setExpectedClosingDate(lead.getExpectedClosingDate());
		existingLead.setLeadOwner(lead.getLeadOwner());
		existingLead.setLeadOwnerEmail(lead.getLeadOwnerEmail());
		existingLead.setLeadStage(lead.getLeadStage());
		existingLead.setCategory(lead.getCategory());
		existingLead.setNextFollowUpOn(lead.getNextFollowUpOn());
		existingLead.setNextFollowUpNotes(lead.getNextFollowUpNotes());
		existingLead.setDescription(lead.getDescription());

		// Update sourceInfo
		if (lead.getSourceInfo() != null) {
			if (existingLead.getSourceInfo() == null) {
				existingLead.setSourceInfo(new SourceInfo());
			}
			existingLead.getSourceInfo().setLeadSource(lead.getSourceInfo().getLeadSource());
			existingLead.getSourceInfo().setCampaignName(lead.getSourceInfo().getCampaignName());
			existingLead.getSourceInfo().setCampaignTeam(lead.getSourceInfo().getCampaignTeam());
			existingLead.getSourceInfo().setCampaignContent(lead.getSourceInfo().getCampaignContent());
		}

		// Update leadHistory
		if (lead.getLeadHistory() != null) {
			if (existingLead.getLeadHistory() == null) {
				existingLead.setLeadHistory(new LeadHistory());
			}
			if (lead.getLeadHistory().getModifiedTime() != null) {
				existingLead.getLeadHistory().setModifiedTime(lead.getLeadHistory().getModifiedTime());
			}
			if (lead.getLeadHistory().getLastViewed() != null) {
				existingLead.getLeadHistory().setLastViewed(lead.getLeadHistory().getLastViewed());
			}
		}

		return leadRepository.save(existingLead);
	}

	public Lead updateLeadHistory(Long leadId, LeadHistory leadHistory) {
		Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new RuntimeException("Lead not found"));

		if (lead.getLeadHistory() == null) {
			LeadHistory history = new LeadHistory();
			history.setLastViewed(leadHistory.getLastViewed());
			LeadHistory dbLead = leadHistoryRepository.save(history);

			lead.setLeadHistory(dbLead);
		} else
			lead.getLeadHistory().setLastViewed(leadHistory.getLastViewed());

		return leadRepository.save(lead);
	}

	// delete lead using leadiD
	public void deleteLead(Long leadId) {
		if (leadId != null) {

			try {
				Optional<Lead> lead = leadRepository.findById(leadId);
				System.out.println(lead.get().getSourceInfo().getSourceInfoId());
				System.out.println(leadId);
				leadRepository.deleteById(leadId);
				if (lead.get().getWonInfo().getWonInfoId() != null)
					wonInfoRepository.deleteById(lead.get().getWonInfo().getWonInfoId());
				if (lead.get().getSourceInfo().getSourceInfoId() != null)
					sourceInfoRepository.deleteById(lead.get().getSourceInfo().getSourceInfoId());
				if (lead.get().getLeadHistory().getLeadHistoryId() != null)
					leadHistoryRepository.deleteById(lead.get().getLeadHistory().getLeadHistoryId());

			} catch (Exception e) {
				System.err.println("Error deleting lead with ID: " + leadId + " - " + e.getMessage());
			}
		} else {
			System.out.println("Null lead ID encountered, skipping.");
		}

	}

	// import data bulk leads

	@Transactional
	public BulkImportResult processLeads(List<Lead> incomingLeads, String filename) {
		List<String> validationErrors = validateLeads(incomingLeads);
		if (!validationErrors.isEmpty()) {
			throw new IllegalArgumentException("Validation failed: " + String.join(", ", validationErrors));
		}

		BulkImportResult result = new BulkImportResult();
		result.setFileName(filename);
		result.setImportTime(LocalDateTime.now());
		result.setUpdatedBy(getCurrentUsername());

		List<Lead> rejectedLeads = new ArrayList<>();

		for (Lead lead : incomingLeads) {
			try {
				processSingleLead(lead, result, rejectedLeads);
			} catch (Exception e) {
				rejectedLeads.add(lead);
				result.incrementRejected();
				Log.error("Error processing lead with mobile: " + lead.getMobileNumber(), e);
			}
		}

		determineImportStatus(result, incomingLeads.size());
		saveImportHistory(result);

		return result;
	}

	private List<String> validateLeads(List<Lead> leads) {
		List<String> errors = new ArrayList<>();
		for (int i = 0; i < leads.size(); i++) {
			Lead lead = leads.get(i);
			if (!StringUtils.hasText(lead.getMobileNumber())) {
				errors.add("Lead at index " + i + " has null or empty mobile number");
			}
			if (!StringUtils.hasText(lead.getLeadOwnerEmail())) {
				errors.add("Lead at index " + i + " has null or empty owner email");
			}
			if (lead.getLeadDate() == null) {
				errors.add("Lead at index " + i + " has null lead date");
			}
		}
		return errors;
	}

	private void processSingleLead(Lead newLead, BulkImportResult result, List<Lead> rejectedLeads) {
		Optional<Lead> existingLeadOpt = leadRepository.findByMobileNumber(newLead.getMobileNumber());

		if (existingLeadOpt.isPresent()) {
			Lead existingLead = existingLeadOpt.get();

			if (!existingLead.getLeadOwnerEmail().equals(newLead.getLeadOwnerEmail())) {
				rejectedLeads.add(newLead);
				result.incrementRejected();
				return;
			}

			updateLeadData(existingLead, newLead);
			processChildEntities(existingLead, newLead);

			leadRepository.save(existingLead);
			result.incrementUpdated();
		} else {
			processChildEntities(newLead, newLead);
			leadRepository.save(newLead);
			result.incrementInserted();
		}
	}

	private void updateLeadData(Lead existing, Lead newData) {
		existing.setLeadOwner(newData.getLeadOwner());
		existing.setContactName(newData.getContactName());
		existing.setAlternateNumber(newData.getAlternateNumber());
		existing.setEmailAddress(newData.getEmailAddress());
		existing.setLeadStage(newData.getLeadStage());
		existing.setExpectedRevenue(newData.getExpectedRevenue());
		existing.setNextFollowUpOn(newData.getNextFollowUpOn());
		existing.setNextFollowUpNotes(newData.getNextFollowUpNotes());
		existing.setDescription(newData.getDescription());
		existing.setSiteVisited(newData.getSiteVisited());
		existing.setLeadDate(newData.getLeadDate());
		existing.setLeadOwnerEmail(newData.getLeadOwnerEmail());
	}

	private void processChildEntities(Lead targetLead, Lead sourceLead) {
		// Process LeadHistory
		if (sourceLead.getLeadHistory() != null) {
			if (targetLead.getLeadHistory() == null) {
				targetLead.setLeadHistory(new LeadHistory());
			}
			updateLeadHistory(targetLead.getLeadHistory(), sourceLead.getLeadHistory());
		} else if (targetLead.getLeadHistory() == null) {
			LeadHistory history = new LeadHistory();
			history.setLeadCreation(LocalDateTime.now());
			targetLead.setLeadHistory(history);
		}

		// Process SourceInfo
		if (sourceLead.getSourceInfo() != null) {
			if (targetLead.getSourceInfo() == null) {
				targetLead.setSourceInfo(new SourceInfo());
			}
			updateSourceInfo(targetLead.getSourceInfo(), sourceLead.getSourceInfo());
		}

		// Process WonInfo
		if (sourceLead.getWonInfo() != null) {
			if (targetLead.getWonInfo() == null) {
				targetLead.setWonInfo(new WonInfo());
			}
			updateWonInfo(targetLead.getWonInfo(), sourceLead.getWonInfo());
		}
	}

	private void updateLeadHistory(LeadHistory target, LeadHistory source) {
		if (source.getLastViewed() != null)
			target.setLastViewed(source.getLastViewed());
		if (source.getModifiedTime() != null)
			target.setModifiedTime(source.getModifiedTime());
		if (target.getLeadCreation() == null)
			target.setLeadCreation(LocalDateTime.now());
	}

	private void updateSourceInfo(SourceInfo target, SourceInfo source) {
		if (source.getLeadSource() != null)
			target.setLeadSource(source.getLeadSource());
		if (source.getCampaignName() != null)
			target.setCampaignName(source.getCampaignName());
		if (source.getCampaignTeam() != null)
			target.setCampaignTeam(source.getCampaignTeam());
		if (source.getCampaignContent() != null)
			target.setCampaignContent(source.getCampaignContent());
		if (source.getLeadDate() != null)
			target.setLeadDate(source.getLeadDate());
		// Set createdBy to the current username
		target.setCreatedBy(getCurrentUsername());
	}

	private void updateWonInfo(WonInfo target, WonInfo source) {
		if (source.getDealDate() != null)
			target.setDealDate(source.getDealDate());
		if (source.getDealPrice() != 0)
			target.setDealPrice(source.getDealPrice());
		if (source.getDealNoOfCents() != 0)
			target.setDealNoOfCents(source.getDealNoOfCents());
		if (source.getDealTotalValue() != 0)
			target.setDealTotalValue(source.getDealTotalValue());
		if (source.getDealDescription() != null)
			target.setDealDescription(source.getDealDescription());
	}

	private void determineImportStatus(BulkImportResult result, int totalLeads) {
		if (result.getTotalProcessed() == totalLeads && result.getRejected() == 0) {
			result.setStatus(ImportStatus.SUCCESS);
		} else if (result.getRejected() == totalLeads) {
			result.setStatus(ImportStatus.FAILED);
		} else {
			result.setStatus(ImportStatus.PARTIAL_SUCCESS);
		}
	}

	private void saveImportHistory(BulkImportResult result) {
		LeadImportHistory history = new LeadImportHistory();
		history.setImportDate(result.getImportTime());
		history.setFileName(result.getFileName());
		history.setRecordsCreated(result.getInserted());
		history.setRecordsUpdated(result.getUpdated());
		history.setRecordsIgnored(result.getRejected());
		history.setStatus(result.getStatus().name());
		history.setUpdatedBy(result.getUpdatedBy());
		history.setUpdatedTime(LocalDateTime.now());
		importHistoryRepository.save(history);
	}

	private String getCurrentUsername() {

		org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext()
				.getAuthentication();

		return authentication != null ? authentication.getName() : "system";

	}

	// Result and Status classes
	public static class BulkImportResult {
		private int inserted;
		private int updated;
		private int rejected;
		private List<Lead> rejectedLeads = new ArrayList<>();
		private String fileName;
		private LocalDateTime importTime;
		private String updatedBy;
		private ImportStatus status;

		public int getInserted() {
			return inserted;
		}

		public void setInserted(int inserted) {
			this.inserted = inserted;
		}

		public int getUpdated() {
			return updated;
		}

		public void setUpdated(int updated) {
			this.updated = updated;
		}

		public int getRejected() {
			return rejected;
		}

		public void setRejected(int rejected) {
			this.rejected = rejected;
		}

		public List<Lead> getRejectedLeads() {
			return rejectedLeads;
		}

		public void setRejectedLeads(List<Lead> rejectedLeads) {
			this.rejectedLeads = rejectedLeads;
		}

		public String getFileName() {
			return fileName;
		}

		public void setFileName(String fileName) {
			this.fileName = fileName;
		}

		public LocalDateTime getImportTime() {
			return importTime;
		}

		public void setImportTime(LocalDateTime importTime) {
			this.importTime = importTime;
		}

		public String getUpdatedBy() {
			return updatedBy;
		}

		public void setUpdatedBy(String updatedBy) {
			this.updatedBy = updatedBy;
		}

		public ImportStatus getStatus() {
			return status;
		}

		public void setStatus(ImportStatus status) {
			this.status = status;
		}

		public int getTotalProcessed() {
			return inserted + updated + rejected;
		}

		public void incrementInserted() {
			inserted++;
		}

		public void incrementUpdated() {
			updated++;
		}

		public void incrementRejected() {
			rejected++;
		}
	}

	public enum ImportStatus {
		SUCCESS, PARTIAL_SUCCESS, FAILED
	}

	// update bulk-leads data from mass edit
	public ResponseEntity<?> bulkLeadsMassUpdate(@RequestBody List<Lead> updatedLeads) {
		List<Lead> savedLeads = new ArrayList<>();
		List<String> errorMessages = new ArrayList<>();

		for (Lead updatedLead : updatedLeads) {
			try {
				// 1. Get existing lead reference
				Lead existingLead = leadRepository.findById(updatedLead.getLeadId())
						.orElseThrow(() -> new RuntimeException("Lead not found with id: " + updatedLead.getLeadId()));

				// 2. Update direct lead fields
				updateLeadFields(existingLead, updatedLead);

				// 3. Process WonInfo
				existingLead.setWonInfo(processWonInfo(updatedLead.getWonInfo(), existingLead.getWonInfo()));

				// 4. Process SourceInfo
				existingLead
						.setSourceInfo(processSourceInfo(updatedLead.getSourceInfo(), existingLead.getSourceInfo()));

				// 5. Save the lead
				savedLeads.add(leadRepository.save(existingLead));

			} catch (Exception e) {
				errorMessages.add("Lead ID " + updatedLead.getLeadId() + ": " + e.getMessage());
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("successCount", savedLeads.size());
		response.put("failedCount", updatedLeads.size() - savedLeads.size());
		response.put("updatedLeads", savedLeads);

		if (!errorMessages.isEmpty()) {
			response.put("errors", errorMessages);
		}

		return ResponseEntity.ok(response);
	}

	private void updateLeadFields(Lead existing, Lead updated) {
		if (updated.getLeadStage() != null)
			existing.setLeadStage(updated.getLeadStage());
		if (updated.getLeadOwner() != null)
			existing.setLeadOwner(updated.getLeadOwner());
		if (updated.getLeadOwnerEmail() != null)
			existing.setLeadOwnerEmail(updated.getLeadOwnerEmail());
		if (updated.getContactName() != null)
			existing.setContactName(updated.getContactName());
		if (updated.getMobileNumber() != null)
			existing.setMobileNumber(updated.getMobileNumber());
		if (updated.getAlternateNumber() != null)
			existing.setAlternateNumber(updated.getAlternateNumber());
		if (updated.getEmailAddress() != null)
			existing.setEmailAddress(updated.getEmailAddress());
		if (updated.getExpectedRevenue() != 0)
			existing.setExpectedRevenue(updated.getExpectedRevenue());
		if (updated.getExpectedClosingDate() != null)
			existing.setExpectedClosingDate(updated.getExpectedClosingDate());
		if (updated.getNextFollowUpOn() != null)
			existing.setNextFollowUpOn(updated.getNextFollowUpOn());
		if (updated.getNextFollowUpNotes() != null)
			existing.setNextFollowUpNotes(updated.getNextFollowUpNotes());
		if (updated.getDescription() != null)
			existing.setDescription(updated.getDescription());
		if (updated.getSiteVisited() != null)
			existing.setSiteVisited(updated.getSiteVisited());
		if (updated.getLeadDate() != null)
			existing.setLeadDate(updated.getLeadDate());
		if (updated.getCategory() != null)
			existing.setCategory(updated.getCategory());
		if (updated.getAssignedManager() != null)
			existing.setAssignedManager(updated.getAssignedManager());
		if (updated.getLeadTitle() != null)
			existing.setLeadTitle(updated.getLeadTitle());

	}

	private WonInfo processWonInfo(WonInfo updatedWonInfo, WonInfo existingWonInfo) {
		if (updatedWonInfo == null) {
			return null; // Remove the reference if null is passed
		}

		// Case 1: Updated WonInfo has ID - update existing record
		if (updatedWonInfo.getWonInfoId() != null) {
			WonInfo wonInfo = wonInfoRepository.findById(updatedWonInfo.getWonInfoId()).orElseThrow(
					() -> new RuntimeException("WonInfo not found with id: " + updatedWonInfo.getWonInfoId()));
			copyWonInfoData(updatedWonInfo, wonInfo);
			return wonInfoRepository.save(wonInfo);
		}

		// Case 2: No ID but has data - create new record
		if (hasWonInfoData(updatedWonInfo)) {
			WonInfo newWonInfo = new WonInfo();
			copyWonInfoData(updatedWonInfo, newWonInfo);
			return wonInfoRepository.save(newWonInfo);
		}

		// Case 3: No ID and no data - return existing record or null
		return existingWonInfo;
	}

	private boolean hasWonInfoData(WonInfo wonInfo) {
		return wonInfo != null && (wonInfo.getDealNoOfCents() != 0 || wonInfo.getDealTotalValue() != 0
				|| wonInfo.getDealPrice() != 0 || wonInfo.getDealDate() != null
				|| (wonInfo.getDealDescription() != null && !wonInfo.getDealDescription().isEmpty()));
	}

	private void copyWonInfoData(WonInfo source, WonInfo target) {
		if (source.getDealNoOfCents() != 0)
			target.setDealNoOfCents(source.getDealNoOfCents());
		if (source.getDealTotalValue() != 0)
			target.setDealTotalValue(source.getDealTotalValue());
		if (source.getDealPrice() != 0)
			target.setDealPrice(source.getDealPrice());
		if (source.getDealDate() != null)
			target.setDealDate(source.getDealDate());
		if (source.getDealDescription() != null)
			target.setDealDescription(source.getDealDescription());
	}

	private SourceInfo processSourceInfo(SourceInfo updatedSourceInfo, SourceInfo existingSourceInfo) {
		if (updatedSourceInfo == null) {
			return null; // Remove the reference if null is passed
		}

		// Case 1: Updated SourceInfo has ID - update existing record
		if (updatedSourceInfo.getSourceInfoId() != null) {
			SourceInfo sourceInfo = sourceInfoRepository.findById(updatedSourceInfo.getSourceInfoId()).orElseThrow(
					() -> new RuntimeException("SourceInfo not found with id: " + updatedSourceInfo.getSourceInfoId()));
			copySourceInfoData(updatedSourceInfo, sourceInfo);
			return sourceInfoRepository.save(sourceInfo);
		}

		// Case 2: No ID but has data - create new record
		if (hasSourceInfoData(updatedSourceInfo)) {
			SourceInfo newSourceInfo = new SourceInfo();
			copySourceInfoData(updatedSourceInfo, newSourceInfo);
			return sourceInfoRepository.save(newSourceInfo);
		}

		// Case 3: No ID and no data - return existing record or null
		return existingSourceInfo;
	}

	private boolean hasSourceInfoData(SourceInfo sourceInfo) {
		return sourceInfo != null && (sourceInfo.getLeadSource() != null || sourceInfo.getCampaignName() != null
				|| sourceInfo.getCampaignTeam() != null || sourceInfo.getCampaignContent() != null
				|| sourceInfo.getLeadDate() != null
				|| (sourceInfo.getCreatedBy() != null && !sourceInfo.getCreatedBy().isEmpty()));
	}

	private void copySourceInfoData(SourceInfo source, SourceInfo target) {
		if (source.getLeadSource() != null)
			target.setLeadSource(source.getLeadSource());
		if (source.getCampaignName() != null)
			target.setCampaignName(source.getCampaignName());
		if (source.getCampaignTeam() != null)
			target.setCampaignTeam(source.getCampaignTeam());
		if (source.getCampaignContent() != null)
			target.setCampaignContent(source.getCampaignContent());
		if (source.getLeadDate() != null)
			target.setLeadDate(source.getLeadDate());
		if (source.getCreatedBy() != null)
			target.setCreatedBy(source.getCreatedBy());
	}

}
